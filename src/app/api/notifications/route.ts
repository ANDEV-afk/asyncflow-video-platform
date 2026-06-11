import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { formatNotificationMessage, getUserNotifications } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [invites, notifications] = await Promise.all([
    prisma.workspaceInvite.findMany({
      where: { invitedUserId: session.user.id },
      include: {
        workspace: {
          select: { id: true, name: true, slug: true },
        },
        invitedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    getUserNotifications(session.user.id),
  ]);

  const formattedNotifications = notifications.map((notification) => ({
    id: notification.id,
    kind: "notification" as const,
    type: notification.type,
    message: formatNotificationMessage(
      notification.type,
      notification.metadata as Record<string, string> | null,
      notification.workspace?.name
    ),
    read: notification.read,
    createdAt: notification.createdAt.toISOString(),
    workspace: notification.workspace,
    metadata: notification.metadata,
  }));

  const formattedInvites = invites.map((invite) => ({
    id: invite.id,
    kind: "invite" as const,
    type: "WORKSPACE_INVITE",
    message: `${invite.invitedBy.name} invited you to ${invite.workspace.name}`,
    read: false,
    createdAt: invite.createdAt.toISOString(),
    workspace: invite.workspace,
    invitedBy: invite.invitedBy,
  }));

  const combined = [...formattedInvites, ...formattedNotifications].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const unreadCount =
    invites.length + notifications.filter((n) => !n.read).length;

  return NextResponse.json({ items: combined, unreadCount });
}
