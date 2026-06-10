import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
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

  const membership =
    await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: session.user.id,
      },
    });

  if (membership?.role !== "OWNER") {
    return NextResponse.json(
      { error: "Only owner can edit workspace" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Workspace name required" },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-");

    const workspace = await prisma.workspace.update({
      where: {
        id: workspaceId,
      },
      data: {
        name: name.trim(),
        slug,
        description,
      },
    });

    return NextResponse.json(workspace);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update workspace" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

  const membership =
    await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: session.user.id,
      },
    });

  if (membership?.role !== "OWNER") {
    return NextResponse.json(
      { error: "Only owner can delete workspace" },
      { status: 403 }
    );
  }

  try {
    await prisma.workspace.delete({
      where: {
        id: workspaceId,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to delete workspace" },
      { status: 500 }
    );
  }
}
