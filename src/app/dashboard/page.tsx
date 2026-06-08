import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import StatsCards from "@/components/dashboard/StatsCards";
import RecentVideos from "@/components/dashboard/RecentVideos";
import { generateThumbnailSignedUrl } from "@/lib/generateThumbnailSignedUrl";

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

  const [totalVideos, totalViews, totalStorage, rawRecentVideos] =
    await Promise.all([ // GET ALL THE DATA ONCE BY RESOLVING THE PROMISE, IF ONE REJECT THEN PARENT PROMISE REJECT.
      prisma.video.count({
        where: { userId },
      }),
      prisma.video.aggregate({
        where: { userId },
        _sum: { viewCount: true },
      }),
      prisma.video.aggregate({ // FOR TOTALLING NOT JUST COUNT 
        where: { userId },
        _sum: { fileSize: true },
      }),
      prisma.video.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const stats = { // GIVING PROPS TO COMPONENT BELOW.
    videos: totalVideos,
    views: totalViews._sum.viewCount ?? 0, // LEFTHAND OPERAND IF NOT NULL OR UNDEFINED OTHERWISE RIGHT ONE.
    storage: `${((totalStorage._sum.fileSize ?? 0) / 1024 / 1024).toFixed(1)} MB`, // BYTES TO MEGABYTES WITH TOFIXED() FOR ROUND-OFF.
    workspaces: 0,
  };

  const recentVideos = await Promise.all( // SAME HERE PROMISE.ALL LOGIC LIKE AS ABOVE.
    rawRecentVideos.map(async (video) => ({
      ...video,
      thumbnailUrl: video.thumbnailKey
        ? await generateThumbnailSignedUrl(video.thumbnailKey)
        : null,
    }))
  );

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {getGreeting()} {session.user.name} 👋
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Record updates and collaborate asynchronously
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/dashboard/record-new">Start Recording</Link>
        </Button>
      </section>

      <StatsCards stats={stats} />
      <RecentVideos videos={recentVideos} />
    </div>
  );
}
