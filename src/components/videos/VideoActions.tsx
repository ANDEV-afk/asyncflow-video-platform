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
                  e.preventDefault()
                }
              >
                Edit
              </DropdownMenuItem>
            }
          />
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