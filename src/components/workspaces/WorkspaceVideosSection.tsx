"use client";

import { useState } from "react";
import { Search, X, Clapperboard } from "lucide-react";

import VideoCard from "@/components/videos/VideoCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video } from "@/types/video";

type VideoWithThumbnail = Video & {
  thumbnailUrl: string | null;
};

type WorkspaceVideosSectionProps = {
  videos: VideoWithThumbnail[];
  totalCount: number;
};

export default function WorkspaceVideosSection({
  videos,
  totalCount,
}: WorkspaceVideosSectionProps) {
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();

  const filteredVideos = query
    ? videos.filter(
        (video) =>
          video.title.toLowerCase().includes(query) ||
          video.description?.toLowerCase().includes(query)
      )
    : videos;

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 rounded-2xl border bg-card/50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-sky-500/10">
            <Clapperboard className="size-4 text-sky-600" />
          </div>
          <div>
            <h2 className="font-semibold tracking-tight">Videos</h2>
            <p className="text-xs text-muted-foreground">
              {totalCount} shared recording{totalCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search videos by title or description..."
            className="h-10 rounded-full border-muted-foreground/15 bg-muted/40 pr-10 pl-10 text-sm shadow-sm"
          />
          {search && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSearch("")}
              className="absolute top-1/2 right-2 size-7 -translate-y-1/2 rounded-full"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      {filteredVideos.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-muted/30 p-12 text-center">
          <Clapperboard className="mx-auto size-10 text-muted-foreground/40" />
          <p className="mt-4 font-medium">
            {query ? "No videos match your search" : "No videos yet"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {query
              ? "Try a different search term."
              : "Upload a non-private video to this workspace."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {filteredVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </section>
  );
}
