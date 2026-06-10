"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Video, VISIBILITY, getWorkspaceIdForVideo } from "@/types/video";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type ShareVideoProps = {
  video: Video;
  trigger?: React.ReactNode;
};

export default function ShareVideoDialog({
  video,
  trigger,
}: ShareVideoProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [workspaces, setWorkspaces] = useState<
    { id: string; name: string }[]
  >([]);
  const [selectedWorkspace, setSelectedWorkspace] =
    useState(video.workspaceId ?? "personal");

  const willBeUnlisted =
    video.visibility === VISIBILITY.PRIVATE;

  useEffect(() => {
    if (open) {
      setSelectedWorkspace(
        video.workspaceId ?? "personal"
      );
      setCopied(false);
    }
  }, [open, video.workspaceId]);

  useEffect(() => {
    async function loadWorkspaces() {
      try {
        const res = await fetch("/api/workspaces");
        if (!res.ok) return;

        const data = await res.json();
        setWorkspaces(data);
      } catch (error) {
        console.error(error);
      }
    }

    if (open) {
      loadWorkspaces();
    }
  }, [open]);

  const handleShare = async () => {
    try {
      setIsSharing(true);

      const workspaceId = getWorkspaceIdForVideo(
        willBeUnlisted
          ? VISIBILITY.UNLISTED
          : video.visibility,
        selectedWorkspace
      );

      const response = await fetch(
        `/api/videos/${video.id}/share`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workspaceId:
              workspaceId ?? "personal",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Failed to share video"
        );
      }

      const shareUrl = `${window.location.origin}/share/${data.shareId}`;

      await navigator.clipboard.writeText(shareUrl);

      setCopied(true);
      toast.success("Share link copied");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to share video"
      );
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button>Share</Button>}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Video</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {willBeUnlisted
              ? "This will make your video unlisted and copy a shareable link."
              : "Copy a shareable link for this video."}
          </p>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Workspace
            </label>

            <Select
              value={selectedWorkspace}
              onValueChange={setSelectedWorkspace}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select workspace" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="personal">
                  Personal
                </SelectItem>

                {workspaces.map((workspace) => (
                  <SelectItem
                    key={workspace.id}
                    value={workspace.id}
                  >
                    {workspace.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <p className="mt-1 text-xs text-muted-foreground">
              Private videos stay personal. Public and
              unlisted videos appear in a workspace only
              when one is selected.
            </p>
          </div>

          <Button
            className="w-full"
            onClick={handleShare}
            disabled={isSharing}
          >
            {isSharing
              ? "Generating..."
              : copied
                ? "Copied!"
                : "Copy Share Link"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
