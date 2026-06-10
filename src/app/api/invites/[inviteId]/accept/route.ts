import { auth } from "@/lib/auth";
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
      await prisma.workspaceInvite.findUnique({ // invite existence checking.
        where: {
          id: inviteId,
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