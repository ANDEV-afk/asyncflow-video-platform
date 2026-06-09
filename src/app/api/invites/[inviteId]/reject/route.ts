import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request,{ params }: {params: Promise<{ inviteId: string }>}) {
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

  const { inviteId } = await params;

  try {
    const invite = await prisma.workspaceInvite.findUnique({
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

    if (invite.invitedUserId !==session.user.id) {
      return NextResponse.json(
        {
          error: "Forbidden",
        },
        {
          status: 403,
        }
      );
    }

    if (invite.status !== "PENDING") {
      return NextResponse.json(
        {
          error:
            "Invite already processed",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.workspaceInvite.update({
      where: {
        id: inviteId,
      },
      data: {
        status:
          "REJECTED",
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {error:"Failed to reject invite"},
      {status: 500}
    );
  }
}