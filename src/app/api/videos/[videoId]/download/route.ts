import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/lib/s3";

export async function GET(request: NextRequest,{params}: {params: Promise<{ videoId: string }>}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  const { videoId } = await params; // videoId is the id of the video to download.

  const video = await prisma.video.findUnique({
    where: {
      id: videoId,
    },
  });

  if (!video) {
    return NextResponse.json(
      {
        error: "Video not found",
      },
      {
        status: 404,
      }
    );
  }

  if (video.userId !== session.user.id) { // if the video is not owned by the user, then return forbidden.
    return NextResponse.json(
      {
        error: "Forbidden",
      },
      {
        status: 403,
      }
    );
  }

  const extension =
    video.mimeType?.split("/")[1] ??video.s3key?.split(".").pop() ??"webm"; // if the mime type is not available, then use the extension from the s3 key.

  const filename =
    `${video.title.replace(/[^\w\s-]/g, "").trim() || "video"}.${extension}`; // if the title is not available, then use the default title.

  const command = new GetObjectCommand({ // get the signed url for the video.
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: video.s3key!,
    ResponseContentDisposition: `attachment; filename="${filename}"`,// to download the video with the filename.
  });

  const url = await getSignedUrl(s3, command, { // get the signed url for the video.
    expiresIn: 60, // 1 minute.
  });

  return NextResponse.json({ // return the signed url for the video.
    url, // signed url for the video.
    filename, // filename of the video.
  });
}