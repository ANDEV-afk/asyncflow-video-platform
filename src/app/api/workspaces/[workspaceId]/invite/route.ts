import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request:NextRequest,{params}: {params: Promise<{workspaceId: string}>}){
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  };
  const {workspaceId} = await params; 

  try {
    const body = await request.json();

    const {email} = body;

    if (!email) {
      return NextResponse.json(
        {
          error: "Email is required",
        },
        {
          status: 400,
        }
      );
    }

    // Verify inviter is OWNER/ADMIN

    const membership =
      await prisma.workspaceMember.findFirst({
        where: {
          workspaceId,
          userId: session.user.id,
        },
      });

    if (!membership || (membership.role !== "OWNER" &&membership.role !== "ADMIN")) {
      return NextResponse.json(
        {
          error: "Forbidden",
        },
        {
          status: 403,
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    if (user.id === session.user.id) { // maybe i invite myself so there is a check.
      return NextResponse.json(
        {
          error:
            "You cannot invite yourself",
        },
        {
          status: 400,
        }
      );
    }
    // now checking member existence.
    const existingMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: user.id
      }
    });

    if (existingMember) {
      return NextResponse.json(
        {
          error:
            "User is already a member",
        },
        {
          status: 409,
        }
      );
    }

    // INVITE CHECKING IF ALREADY SENT OR NOT.
    const existingInvite = await prisma.workspaceInvite.findFirst({
      where: {
        workspaceId,
        invitedUserId: user.id,
        status: "PENDING"
      }
    });

    if (existingInvite) {
      return NextResponse.json(
        {
          error:
            "Invite already sent",
        },
        {
          status: 409,
        }
      );
    }
    // ACTUAL INVITE CREATE
    const invite = await prisma.workspaceInvite.create({
      data: {
        workspaceId,
        invitedUserId: user.id,
        invitedById: session.user.id,
        role: "MEMBER" // invite the user to be as member of the workspace.
      }
    });

    return NextResponse.json(
      {
        success: true,
        invite,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {error:"Failed to send invite"},
      {status: 500}
    );
  }
}