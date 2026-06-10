import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      workspaceId: string;
      memberId: string;
    }>;
  }
) {
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

  const {
    workspaceId,
    memberId,
  } = await params;

  const currentMembership =
    await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: session.user.id,
      },
    });

  if (
    currentMembership?.role !==
    "OWNER"
  ) {
    return NextResponse.json(
      {
        error:
          "Only owner can remove members",
      },
      {
        status: 403,
      }
    );
  }

  const member =
    await prisma.workspaceMember.findUnique({
      where: {
        id: memberId,
      },
    });

  if (!member) {
    return NextResponse.json(
      {
        error: "Member not found",
      },
      {
        status: 404,
      }
    );
  }

  if (member.role === "OWNER") {
    return NextResponse.json(
      {
        error:
          "Owner cannot be removed",
      },
      {
        status: 400,
      }
    );
  }

  await prisma.workspaceMember.delete({
    where: {
      id: memberId,
    },
  });

  return NextResponse.json({
    success: true,
  });
}