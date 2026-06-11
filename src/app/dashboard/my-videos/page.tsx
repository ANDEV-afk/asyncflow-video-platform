import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import MyVideosList from "@/components/videos/MyVideosList";
import { generateThumbnailSignedUrl } from "@/lib/generateThumbnailSignedUrl";

export default async function MyVideosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/sign-in");
  }

  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const rawVideos = await prisma.video.findMany({
    where: {
      userId: session.user.id,
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  if (rawVideos.length === 0 && !query) {
    return (
      <div className="space-y-6">
        <DashboardPageHeader
          title="My Videos"
          description="Manage your async recordings"
        />

        <div className="rounded-2xl border border-dashed bg-muted/30 p-10 text-center">
          <h2 className="text-lg font-semibold">No videos yet</h2>
          <p className="mt-1 text-muted-foreground">
            Record your first video to get started.
          </p>
        </div>
      </div>
    );
  }

  const videos = await Promise.all(
    rawVideos.map(async (video) => ({
      ...video,
      thumbnailUrl: video.thumbnailKey
        ? await generateThumbnailSignedUrl(video.thumbnailKey)
        : null,
    }))
  );

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="My Videos"
        description={
          query
            ? `${videos.length} result${videos.length === 1 ? "" : "s"} for "${query}"`
            : "Manage your async recordings"
        }
      />

      <MyVideosList videos={videos} query={query} />
    </div>
  );
}
