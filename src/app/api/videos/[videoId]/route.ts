import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {prisma} from '@/lib/prisma';
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3";

export async function PUT(request: NextRequest,{
  params, // params se videoId jahan edit hoga.
}: {
  params: Promise<{videoId: string}>
}){
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  console.log(session);
  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  };

  const {videoId} = await params; 

  const video = await prisma.video.findUnique({
    where: {
      id: videoId,
    },
  });

  if (!video) {
    return NextResponse.json({
      error: "Video not found"
    },{status: 404}
  )};

  if (video?.userId !== session?.user.id) {
    return NextResponse.json(
      {error: "Forbidden"},
      {status: 403}
    );
  }

  const body = await request.json();

  const {title,description,visibility} = body;

  const updatedVideo = await prisma.video.update({
    where: {
      id: videoId,
    },
    data: {
      title,
      description,
      visibility,
    },
  });

  return NextResponse.json(updatedVideo);
  };

export async function DELETE(request: NextRequest,{params}: {params: Promise<{videoId: string}>}){
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  };

  const {videoId} = await params; 
  try {
    const video = await prisma.video.findUnique({
      where: {
        id: videoId,
      }
    });

    if (!video) {
      return NextResponse.json(
        {
          error: "Video not found"
        },
        {
          status: 404,
        }
      );
    }

    if (video?.userId !== session?.user.id) {
      return NextResponse.json(
        {error: "Forbidden"},
        {status: 403}
      );
    }
    // Delete from S3
    if (video.s3key) {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: video.s3key,
        })
      );
    }
    // DELETE DB Record
    await prisma.video.delete({
      where: {
        id: videoId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Video deleted successfully",
      status: 200
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Failed to delete video"
      },
      {
        status: 500,
      }
    );
  }
}