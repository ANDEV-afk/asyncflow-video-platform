import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSignedUrl } from "@/lib/generateSignedUrl";
import EditVideoDialog from "@/components/videos/EditVideoDialog";
import DeleteVideoDialog from "@/components/videos/DeleteVideoDialog";

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

  // Security Check
  if (video.userId !== session.user.id) {
    notFound();
  }

  const signedUrl = await generateSignedUrl(
    video.s3key! // temporary url for playback at page.
  );

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <DashboardPageHeader
          title={video.title}
          description="Video Details"
        />
        <div className="flex gap-2">
        <EditVideoDialog video={video} />

        <DeleteVideoDialog videoId={video.id}/>
        </div>
      </div>
      {/* Video Player Placeholder */}
      <div className="aspect-video w-full rounded-xl border bg-muted flex items-center justify-center">
        <video
            src={signedUrl}
            controls
            className="aspect-video w-full"
          />
      </div>

      {/* Metadata */}
      <div className="grid gap-4 md:grid-cols-2">

        <div className="rounded-lg border p-4">
          <h3 className="font-semibold mb-2">
            Recording Type
          </h3>

          <p className="text-muted-foreground">
            {video.recordingType ?? "N/A"}
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="font-semibold mb-2">
            Visibility
          </h3>

          <p className="text-muted-foreground">
            {video.visibility}
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="font-semibold mb-2">
            Processing Status
          </h3>

          <p className="text-muted-foreground">
            {video.processingStatus}
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="font-semibold mb-2">
            File Size
          </h3>

          <p className="text-muted-foreground">
            {video.fileSize
              ? `${(video.fileSize / 1024 / 1024).toFixed(2)} MB`
              : "N/A"}
          </p>
        </div>

      </div>

      {/* Description */}
      <div className="rounded-lg border p-4">
        <h3 className="font-semibold mb-2">
          Description
        </h3>

        <p className="text-muted-foreground">
          {video.description || "No description provided."}
        </p>
      </div>

      {/* Dates */}
      <div className="rounded-lg border p-4">
        <h3 className="font-semibold mb-2">
          Created
        </h3>

        <p className="text-muted-foreground">
          {video.createdAt.toLocaleString()}
        </p>
      </div>
    </div>
  );
}