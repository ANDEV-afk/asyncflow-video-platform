import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { auth } from "@/lib/auth";
import { getVideoComments } from "@/lib/comments";
import { prisma } from "@/lib/prisma";
import { generateSignedUrl } from "@/lib/generateSignedUrl";
import EditVideoDialog from "@/components/videos/EditVideoDialog";
import DeleteVideoDialog from "@/components/videos/DeleteVideoDialog";
import VideoComments from "@/components/comments/VideoComments";

export default async function VideoPage({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const { videoId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const video = await prisma.video.findUnique({
    where: {
      id: videoId,
    },
  });

  if (!video) {
    notFound();
  }

  const isOwner = video.userId === session.user.id;

  if (!isOwner) {
    if (!video.workspaceId) {
      notFound();
    }

    const membership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: video.workspaceId,
        userId: session.user.id,
      },
    });

    if (!membership) {
      notFound();
    }
  }

  const signedUrl = await generateSignedUrl(
    video.s3key! // temporary url for playback at page.
  );

  const comments = await getVideoComments(video.id, session.user.id);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <DashboardPageHeader
          title={video.title}
          description="Video Details"
        />

        {isOwner ? (
          <div className="flex gap-2">
            <EditVideoDialog video={video} />
            <DeleteVideoDialog videoId={video.id} />
          </div>
        ) : null}
      </div>
      {/* Video Player Placeholder */}
      <div className="aspect-video w-full rounded-xl border bg-muted flex items-center justify-center">
        <video
          src={signedUrl}
          controls
          className="aspect-video w-full"
        />
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="mb-2 font-semibold">
          Description
        </h3>

        <p className="text-muted-foreground">
          {video.description ||
            "No description provided."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">
            Recording Type
          </h3>

          <p className="text-muted-foreground">
            {video.recordingType ?? "N/A"}
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">
            Visibility
          </h3>

          <p className="text-muted-foreground">
            {video.visibility}
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">
            File Size
          </h3>

          <p className="text-muted-foreground">
            {video.fileSize
              ? `${(video.fileSize / 1024 / 1024).toFixed(2)} MB`
              : "N/A"}
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">
            Created
          </h3>

          <p className="text-muted-foreground">
            {video.createdAt.toLocaleString()}
          </p>
        </div>
      </div>

      <VideoComments
        videoId={video.id}
        initialComments={comments}
        currentUser={{
          id: session.user.id,
          name: session.user.name,
          image: session.user.image ?? null,
        }}
      />
    </div>
  );
}
