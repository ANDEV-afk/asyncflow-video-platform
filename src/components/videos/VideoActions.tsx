"use client";
import { MoreVertical } from "lucide-react";
import { Video } from "@/generated/prisma/client";
import EditVideoDialog from "./EditVideoDialog";
import DeleteVideoDialog from "./DeleteVideoDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import ShareVideoDialog from "./ShareVideoDialog";
import DownloadButton from "./DownloadButton";
type VideoActionsProps = {
  video: Video;
};

export default function VideoActions({
  video,
}: VideoActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="center"
        className="w-56"
      >
        <EditVideoDialog
            video={video}
            trigger={
              <DropdownMenuItem
                onSelect={(e) =>
                  e.preventDefault() // matlab navigation na ho after clicking edit option.
                }
              >
                Edit
              </DropdownMenuItem>
            }
          />
        <DropdownMenuSeparator />

        <ShareVideoDialog
          videoId={video.id}
          shareId={video.shareId}
        />
        <DropdownMenuSeparator />

        <DownloadButton videoId={video.id} />
        <DropdownMenuSeparator />
        
        <DeleteVideoDialog
          videoId={video.id}
          trigger={
            <DropdownMenuItem
              onSelect={(e) =>
                e.preventDefault()
              }
              className="text-destructive"
            >
              Delete
            </DropdownMenuItem>
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}