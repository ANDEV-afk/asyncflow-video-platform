import { headers } from "next/headers";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import { Visibility } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { s3 } from "@/lib/s3";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();

    const file = formData.get("video");
    const title =
      (formData.get("title") as string) ?? "Untitled Recording";
    const description = (formData.get("description") as string) || null; // getting these details from formdata at frontend to upload it to db.
    const visibilityValue = formData.get("visibility") as string | null;
    const visibility: Visibility =
      visibilityValue === Visibility.PUBLIC ||
      visibilityValue === Visibility.UNLISTED
        ? visibilityValue
        : Visibility.PRIVATE;
    const recordingType = formData.get("recordingType") as string;

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No video file provided" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const key =
      `${session.user.id}/${Date.now()}.webm`;
      // User ID se folder jaisa structure
      // Timestamp se unique filename
      // Har user ki videos alag folder mein

    await s3.send(
      new PutObjectCommand({
        Bucket:
          process.env.AWS_BUCKET_NAME,

        Key: key, // for aws to identify files internally.

        Body: buffer, // NODEJS buffer.

        ContentType:
          file.type || "video/webm",
      })
    );

    const video = await prisma.video.create({
      data: {
        title,
        description,
        visibility,
        userId: session.user.id,
        videoUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
        s3key: key,
      
        mimeType:
          file.type,
      
        fileSize:
          buffer.length,
      
        recordingType:
          recordingType === "SCREEN"
            ? "SCREEN"
            : recordingType === "CAMERA"
            ? "CAMERA"
            : "SCREEN_AND_CAMERA",
      }
    });

    return NextResponse.json({
      success: true,
      video,
    });
  } catch (error) {
    console.error(error);

    const message =
      error instanceof Error ? error.message : "Failed to upload recording";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}