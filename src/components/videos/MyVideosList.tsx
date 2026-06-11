"use client";

import { Video } from "@/types/video";
import VideoCard from "./VideoCard";

type VideoWithThumbnail = Video & {
  thumbnailUrl: string | null;
};

type MyVideosListProps = {
  videos: VideoWithThumbnail[];
  query?: string;
};

export default function MyVideosList({ videos, query = "" }: MyVideosListProps) {
  if (videos.length > 0) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed bg-muted/30 p-10 text-center">
      <h2 className="text-lg font-semibold">No recordings found</h2>
      <p className="mt-1 text-muted-foreground">
        {query ? "Try a different search term." : "No videos to show."}
      </p>
    </div>
  );
}
