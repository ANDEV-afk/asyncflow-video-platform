import { ActivityType, createActivity } from "@/lib/activity";
import { auth } from "@/lib/auth";
import {
  NotificationType,
  createNotificationsForMembers,
} from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest,{params}: {params: Promise<{ inviteId: string }>}) {
  const session =
    await auth.api.getSession({
      headers: await headers(),
    });

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { inviteId } = await params; // after get request data came in notification bell, there we are extracting InviteId.

  try {
    const invite =
      await prisma.workspaceInvite.findUnique({
        where: {
          id: inviteId,
        },
        include: {
          workspace: {
            select: { name: true },
          },
        },
      });

    if (!invite) {
      return NextResponse.json(
        {
          error: "Invite not found",
        },
        {
          status: 404,
        }
      );
    }
    // Invite Belongs To User?
    if (invite.invitedUserId !==session.user.id) { // i sent the request but some other guy accepted at its account that's check.
      return NextResponse.json(
        {
          error: "Forbidden",
        },
        {
          status: 403,
        }
      );
    }
    // NOW WORKSPACE MEMBER CREATION AND UPDATION OF INVITE STATUS IN A TRANSACTION.
    await prisma.$transaction(
      async (tx) => {
        await tx.workspaceMember.create({
          data: {
            workspaceId:
              invite.workspaceId,

            userId:
              invite.invitedUserId, // invitedUserId not session id as other person can do it for that.

            role:
              invite.role,
          },
        });

        await tx.workspaceInvite.delete({
          where: {
            id: invite.id,
          },
        });
      }
    );

    await createActivity({
      type: ActivityType.MEMBER_JOINED,
      userId: session.user.id,
      workspaceId: invite.workspaceId,
      metadata: {
        memberName: session.user.name,
      },
    });

    await createNotificationsForMembers({
      type: NotificationType.MEMBER_JOINED,
      workspaceId: invite.workspaceId,
      actorId: session.user.id,
      metadata: {
        actorId: session.user.id,
        actorName: session.user.name,
        workspaceName: invite.workspace.name,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to accept invite",
      },
      {
        status: 500,
      }
    );
  }
}