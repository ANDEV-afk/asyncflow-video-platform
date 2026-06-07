"use client";
import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";

import { Video } from "@/generated/prisma/client";

import VideoActions from "./VideoActions";

type VideoCardProps = {
  video: Video;
};

export default function VideoCard({
  video,
}: VideoCardProps) {
  const videoLink = `/dashboard/my-videos/${video.id}`;
  return (
    <div className="overflow-hidden rounded-xl border transition hover:shadow-md">

      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted">

        {/* Actions */}
        <div
          className="absolute left-3 top-3 z-20"
          onClick={(e) => e.stopPropagation()} // means stop propagation of event to parent elements.
        >
          {/* Click Delete
                  ↓
            Delete Dialog Open
                    ↓
          Card ko pata hi nahi chala otherwise woh
          video page pe navigate kardega jo ab exist nhi karta same for edit*/}
          <VideoActions video={video} />
        </div>

        <Link
          href={videoLink}
          className="block h-full w-full"
        >
          {video.thumbnailUrl ? (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover transition hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Play className="size-12 text-muted-foreground" />
            </div>
          )}

          <div className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white">
            {video.recordingType ?? "VIDEO"}
          </div>
        </Link>
      </div>

      {/* Metadata */}
      <Link href={videoLink}>
        <div className="space-y-3 p-4">
          <h3 className="line-clamp-1 font-semibold">
            {video.title}
          </h3>

          <p className="text-sm text-muted-foreground">
            {video.createdAt.toLocaleDateString()}
          </p>

          <div className="flex items-center gap-2">
            <span className="rounded-full border px-2 py-1 text-xs">
              {video.visibility}
            </span>

            <span className="text-xs text-muted-foreground">
              {video.viewCount} views
            </span>

            {video.duration && (
              <span className="text-xs text-muted-foreground">
                • {Math.floor(video.duration / 60)}:
                {(video.duration % 60)
                  .toString()
                  .padStart(2, "0")}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}