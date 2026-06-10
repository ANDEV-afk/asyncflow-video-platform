import { Visibility } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveVideoWorkspaceId } from "@/lib/video-workspace";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
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

  const { videoId } = await params;

  const video = await prisma.video.findUnique({
    where: {
      id: videoId,
    },
  });

  if (!video) {
    return NextResponse.json(
      { error: "Video not found" },
      { status: 404 }
    );
  }

  if (video.userId !== session.user.id) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const { workspaceId: requestedWorkspaceId } = body as {
    workspaceId?: string | null;
  };

  const nextVisibility =
    video.visibility === Visibility.PRIVATE
      ? Visibility.UNLISTED
      : video.visibility;

  const workspaceInput =
    requestedWorkspaceId !== undefined
      ? requestedWorkspaceId === "personal"
        ? null
        : requestedWorkspaceId
      : video.workspaceId;

  const workspaceResult =
    await resolveVideoWorkspaceId({
      visibility: nextVisibility,
      workspaceId: workspaceInput,
      userId: session.user.id,
    });

  if ("error" in workspaceResult) {
    return NextResponse.json(
      { error: workspaceResult.error },
      { status: workspaceResult.status }
    );
  }

  const updatedVideo = await prisma.video.update({
    where: {
      id: videoId,
    },
    data: {
      visibility: nextVisibility,
      workspaceId: workspaceResult.workspaceId,
    },
  });

  return NextResponse.json({
    success: true,
    shareId: updatedVideo.shareId,
    visibility: updatedVideo.visibility,
    workspaceId: updatedVideo.workspaceId,
  });
}
