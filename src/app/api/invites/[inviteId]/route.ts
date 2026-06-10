import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ inviteId: string }>;
  }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { inviteId } = await params;

  try {
    const invite =
      await prisma.workspaceInvite.findUnique({
        where: {
          id: inviteId,
        },
      });

    if (!invite) {
      return NextResponse.json(
        { error: "Invite not found" },
        { status: 404 }
      );
    }

    const membership =
      await prisma.workspaceMember.findFirst({
        where: {
          workspaceId: invite.workspaceId,
          userId: session.user.id,
        },
      });

    if (membership?.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only owner can cancel invites" },
        { status: 403 }
      );
    }

    await prisma.workspaceInvite.delete({
      where: {
        id: inviteId,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to cancel invite" },
      { status: 500 }
    );
  }
}
