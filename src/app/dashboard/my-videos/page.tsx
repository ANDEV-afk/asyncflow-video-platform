import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import MyVideosList from "@/components/videos/MyVideosList";
import { generateThumbnailSignedUrl } from "@/lib/generateThumbnailSignedUrl";

export default async function MyVideosPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/sign-in");
  }

  const rawVideos = await prisma.video.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (rawVideos.length === 0) {
    return (
      <div className="space-y-6">
        <DashboardPageHeader
          title="My Videos"
          description="Manage Recordings"
        />

        <div className="rounded-lg border p-10 text-center">
          <h2 className="text-lg font-semibold">
            No videos yet
          </h2>

          <p className="text-muted-foreground">
            Record your first video to get started.
          </p>
        </div>
      </div>
    );
  }
  // Database se videos lao → har video ke liye thumbnail ka signed URL parallel mein banao → sab ready hone ke baad VideoCard render karo.
  // Promise.all + map = fast parallel processing with same order preserved

  const videos = await Promise.all(//// videos = [video1WithUrl, video2WithUrl, video3WithUrl]
    rawVideos.map(async (video) => ({
      ...video, // remaining props of video should be same only thumbnail changed here.

      thumbnailUrl: video.thumbnailKey
        ? await generateThumbnailSignedUrl( // promise.all use as for loop can have latency if each iteration occur
            video.thumbnailKey
          )
        : null,
    }))
  );

    return (
      <div className="space-y-6">
        <DashboardPageHeader
          title="My Videos"
          description="Manage Recordings"
        />

        <MyVideosList videos={videos} />
      </div>
    );
  }