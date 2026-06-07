import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest,{params}:{params:Promise<{videoId:string}>}
){
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401
      }
    )
  };

  const {videoId} = await params;

  const video = await prisma.video.findUnique({
    where: {
      id: videoId
    }
  });

  if (!video) {
    return NextResponse.json(
      {
        error: "Video not found"
      },
      {
        status: 404
      }
    )
  };

  if (video.userId !== session.user.id) {
    return NextResponse.json(
      {
        error: "Forbidden"
      },
      {
        status: 403,
      }
    )
  };

  const updatedVideo = await prisma.video.update({
    where: {
      id: videoId,
    },
    data: {
      visibility: "UNLISTED"
    },
  });

  return NextResponse.json(
    {
     success: true,
    shareId: updatedVideo.shareId,
    }
  );
}