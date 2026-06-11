import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import StatsCards from "@/components/dashboard/StatsCards";
import RecentVideos from "@/components/dashboard/RecentVideos";
import RecentActivitySidebar from "@/components/dashboard/RecentActivitySidebar";
import { generateThumbnailSignedUrl } from "@/lib/generateThumbnailSignedUrl";
import { Sparkles, Video } from "lucide-react";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const userId = session.user.id;

  const [
    totalVideos,
    totalViews,
    totalStorage,
    rawRecentVideos,
    totalWorkspaces,
    recentComments,
    recentMemberships,
  ] = await Promise.all([
    prisma.video.count({ where: { userId } }),
    prisma.video.aggregate({
      where: { userId },
      _sum: { viewCount: true },
    }),
    prisma.video.aggregate({
      where: { userId },
      _sum: { fileSize: true },
    }),
    prisma.video.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.workspaceMember.count({ where: { userId } }),
    prisma.comment.findMany({
      where: {
        OR: [
          { userId },
          { video: { userId } },
          {
            video: {
              workspace: {
                members: { some: { userId } },
              },
            },
          },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        video: { select: { id: true, title: true } },
        user: { select: { name: true } },
      },
    }),
    prisma.workspaceMember.findMany({
      where: { userId },
      orderBy: { id: "desc" },
      take: 5,
      include: {
        workspace: { select: { id: true, name: true, createdAt: true } },
      },
    }),
  ]);

  const stats = {
    videos: totalVideos,
    views: totalViews._sum.viewCount ?? 0,
    storage: `${((totalStorage._sum.fileSize ?? 0) / 1024 / 1024).toFixed(1)} MB`,
    workspaces: totalWorkspaces,
  };

  const recentVideos = await Promise.all(
    rawRecentVideos.map(async (video) => ({
      ...video,
      thumbnailUrl: video.thumbnailKey
        ? await generateThumbnailSignedUrl(video.thumbnailKey)
        : null,
    }))
  );

  const sidebarWorkspaces = recentMemberships.map((m) => ({
    id: m.workspace.id,
    name: m.workspace.name,
    joinedAt: m.workspace.createdAt,
  }));

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_300px]">
      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-violet-500/10 via-background to-sky-500/10 p-6 shadow-sm md:p-8">
          <div className="absolute -top-12 -right-12 size-40 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute -bottom-8 -left-8 size-32 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="relative">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
              <Sparkles className="size-3.5 text-violet-500" />
              Async collaboration
            </div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {getGreeting()}, {session.user.name}
            </h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Record updates, share with your team, and collaborate without
              scheduling another meeting.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full">
                <Link href="/dashboard/record-new">
                  <Video className="mr-2 size-4" />
                  Start Recording
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full"
              >
                <Link href="/dashboard/workspaces">View Workspaces</Link>
              </Button>
            </div>
          </div>
        </section>

        <StatsCards stats={stats} />
        <RecentVideos videos={recentVideos} />
      </div>

      <RecentActivitySidebar
        recentVideos={rawRecentVideos.map((v) => ({
          id: v.id,
          title: v.title,
          createdAt: v.createdAt,
        }))}
        recentComments={recentComments}
        recentWorkspaces={sidebarWorkspaces}
      />
    </div>
  );
}
