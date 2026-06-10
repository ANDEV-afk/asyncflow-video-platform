import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ workspaceId: string }>;
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

  const { workspaceId } = await params;

  const currentMembership =
    await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: session.user.id,
      },
    });

  if (currentMembership?.role !== "OWNER") {
    return NextResponse.json(
      { error: "Only owner can transfer ownership" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { memberId } = body;

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID required" },
        { status: 400 }
      );
    }

    const targetMember =
      await prisma.workspaceMember.findUnique({
        where: {
          id: memberId,
        },
      });

    if (!targetMember || targetMember.workspaceId !== workspaceId) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    if (targetMember.role === "OWNER") {
      return NextResponse.json(
        { error: "Cannot transfer to current owner" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.workspaceMember.update({
        where: {
          id: currentMembership.id,
        },
        data: {
          role: "MEMBER",
        },
      });

      await tx.workspaceMember.update({
        where: {
          id: targetMember.id,
        },
        data: {
          role: "OWNER",
        },
      });

      await tx.workspace.update({
        where: {
          id: workspaceId,
        },
        data: {
          ownerId: targetMember.userId,
        },
      });
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to transfer ownership" },
      { status: 500 }
    );
  }
}
