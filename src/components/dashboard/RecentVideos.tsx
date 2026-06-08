import { Video } from "@/generated/prisma/client";
import EmptyState from "@/components/dashboard/EmptyState";
import VideoCard from "@/components/videos/VideoCard";

type VideoWithThumbnail = Video & {
  thumbnailUrl: string | null;
};

type RecentVideosProps = {
  videos: VideoWithThumbnail[];
};

export default function RecentVideos({ videos }: RecentVideosProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">
        Recent Recordings
      </h2>

      {videos.length === 0 ? (
        <EmptyState
          title="No recordings yet"
          description="Start your first async recording"
          actionLabel="Record Now"
          actionHref="/dashboard/record-new"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </section>
  );
}
