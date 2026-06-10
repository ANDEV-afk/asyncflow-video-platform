"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, Eye, Play } from "lucide-react";
import { Visibility, Video } from "@/types/video";
import VideoActions from "./VideoActions";

type VideoWithThumbnail = Video & {
  thumbnailUrl: string | null;
};

type VideoCardProps = {
  video: VideoWithThumbnail;
};

const visibilityStyles: Record<Visibility, string> = {
  PUBLIC: "bg-green-500/10 text-green-700 border-green-200 dark:text-green-400",
  UNLISTED: "bg-amber-500/10 text-amber-700 border-amber-200 dark:text-amber-400",
  PRIVATE: "bg-muted text-muted-foreground border-border",
};

function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;
}

export default function VideoCard({ video }: VideoCardProps) {
  const videoLink = `/dashboard/my-videos/${video.id}`;

  return (
    <div className="group overflow-hidden rounded-xl border bg-card transition hover:border-primary/20 hover:shadow-md">
      <div className="relative aspect-video bg-muted">
        <div
          className="absolute left-3 top-3 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <VideoActions video={video} />
        </div>

        <Link href={videoLink} className="block h-full w-full">
          {video.thumbnailUrl ? (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover transition group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Play className="size-12 text-muted-foreground" />
            </div>
          )}

          <div className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white">
            {video.recordingType ?? "VIDEO"}
          </div>

          {video.duration != null && (
            <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
              {formatDuration(video.duration)}
            </div>
          )}
        </Link>
      </div>

      <Link href={videoLink} className="block">
        <div className="space-y-2 p-4">
          <h3 className="line-clamp-1 text-sm font-semibold leading-snug transition-colors group-hover:text-primary">
            {video.title}
          </h3>

          {video.description && (
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {video.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3" />
              {video.createdAt.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="size-3" />
              {video.viewCount} views
            </span>
          </div>

          <span
            className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${visibilityStyles[video.visibility]}`}
          >
            {video.visibility}
          </span>
        </div>
      </Link>
    </div>
  );
}
