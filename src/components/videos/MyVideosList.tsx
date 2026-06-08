"use client";

import { Video } from "@/generated/prisma/client";
import VideoCard from "./VideoCard";
import { useMyVideosSearch } from "./MyVideosSearchContext";

type VideoWithThumbnail = Video & {
  thumbnailUrl: string | null;
};

type MyVideosListProps = {
  videos: VideoWithThumbnail[];
};
// Server loads all videos once → navbar input updates shared context → list filters that array client-side and re-renders matching cards instantly.

export default function MyVideosList({ videos }: MyVideosListProps) {
  const { search } = useMyVideosSearch();
  const query = search.trim().toLowerCase(); // for quering the filter we are using this variable.

  const filteredVideos = query
    ? videos.filter(
        (video) =>
          video.title.toLowerCase().includes(query) ||
          video.description?.toLowerCase().includes(query)
      )
    : videos;

  if (filteredVideos.length > 0) { // conditional rendering
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredVideos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-10 text-center">
      <h2 className="text-lg font-semibold">No recordings found</h2>
      <p className="text-muted-foreground">
        {query ? "Try a different search term." : "No videos to show."}
      </p>
    </div>
  );
}
