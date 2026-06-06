import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("video");
    const title = (formData.get("title") as string) || "Untitled Recording";
    const recordingType = formData.get("recordingType") as string;

    if (!(file instanceof File)) {
      return Response.json({ error: "No video file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      session.user.id
    );
    await mkdir(uploadsDir, { recursive: true });

    const filename = `${Date.now()}.webm`;
    const filepath = path.join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    const videoUrl = `/uploads/${session.user.id}/${filename}`;

    const video = await prisma.video.create({
      data: {
        title,
        videoUrl,
        mimeType: file.type || "video/webm",
        fileSize: buffer.length,
        userId: session.user.id,
        recordingType:
          recordingType === "SCREEN"
            ? "SCREEN"
            : recordingType === "CAMERA"
              ? "CAMERA"
              : "SCREEN_AND_CAMERA",
      },
    });

    return Response.json({ video });
  } catch {
    return Response.json({ error: "Failed to upload recording" }, { status: 500 });
  }
}
