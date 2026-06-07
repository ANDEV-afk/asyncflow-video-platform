import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {prisma} from '@/lib/prisma';
import { redirect } from "next/navigation";
import VideoCard from "@/components/videos/VideoCard";

export default async function MyVideosPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/sign-in");
  }

  const videos = await prisma.video.findMany({
    where:{
      userId:session.user.id
    },
    orderBy:{
      createdAt:"desc"
    }
  })
  if (videos.length === 0) {
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

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="My Videos"
        description="Manage Recordings"
      />
  
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video)=>{
        return (
          <VideoCard
            key={video.id}
            video={video}
          />
        );
      })}
      </div>
    </div>
  );
}
