import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { generateSignedUrl } from "@/lib/generateSignedUrl";
import { getVideoComments } from "@/lib/comments";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import VideoComments from "@/components/comments/VideoComments";
import type { CommentUser } from "@/types/comment";

export default async function SharePage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const video =
    await prisma.video.findUnique({
      where: {
        shareId,
      },
    });

  if (!video) {
    notFound();
  }

  if (
    video.visibility === "PRIVATE"
  ) {
    notFound();
  }

  const signedUrl =
  await generateSignedUrl(
    video.s3key!
  );

  await prisma.video.update({
    where: {
      id: video.id,
    },
    data: {
      viewCount: {
        increment: 1,
      },
    },
  });

  const comments = await getVideoComments(
    video.id,
    session?.user?.id ?? null
  );
  const currentUser: CommentUser | null = session?.user
    ? {
        id: session.user.id,
        name: session.user.name,
        image: session.user.image ?? null,
      }
    : null;

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8">
      <h1 className="text-4xl font-bold">
        {video.title}
      </h1>

      <p className="mt-2 text-muted-foreground">
        {video.description}
      </p>

      <p className="mt-2 text-sm">
        {video.viewCount} views
      </p>

      <video
        controls
        src={signedUrl}
        className="mt-6 w-full rounded-lg"
      />

      <VideoComments
        videoId={video.id}
        initialComments={comments}
        currentUser={currentUser}
      />
    </div>
  );
}