"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Video,
  Visibility,
  VISIBILITY,
  getWorkspaceIdForVideo,
} from "@/types/video";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type EditVideoDialogProps = {
  video: Video;
  trigger?: React.ReactNode;
};

export default function EditVideoDialog({
  video,
  trigger,
}: EditVideoDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(
    video.description ?? ""
  );
  const [visibility, setVisibility] =
    useState<Visibility>(video.visibility);
  const [workspaces, setWorkspaces] = useState<
    { id: string; name: string }[]
  >([]);
  const [selectedWorkspace, setSelectedWorkspace] =
    useState(
      video.workspaceId ?? "personal"
    );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(video.title);
      setDescription(video.description ?? "");
      setVisibility(video.visibility);
      setSelectedWorkspace(
        video.workspaceId ?? "personal"
      );
      setError("");
    }
  }, [open, video]);

  useEffect(() => {
    async function loadWorkspaces() {
      try {
        const res = await fetch("/api/workspaces");
        if (!res.ok) return;

        const data = await res.json();
        setWorkspaces(data);
      } catch (err) {
        console.error(err);
      }
    }

    if (open) {
      loadWorkspaces();
    }
  }, [open]);

  useEffect(() => {
    if (
      selectedWorkspace !== "personal" &&
      visibility === VISIBILITY.PRIVATE
    ) {
      setVisibility(VISIBILITY.UNLISTED);
    }
  }, [selectedWorkspace, visibility]);

  useEffect(() => {
    if (visibility === VISIBILITY.PRIVATE) {
      setSelectedWorkspace("personal");
    }
  }, [visibility]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError("");

      const response = await fetch(
        `/api/videos/${video.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description,
            visibility,
            workspaceId: getWorkspaceIdForVideo(
              visibility,
              selectedWorkspace
            ),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Failed to update video"
        );
      }

      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button>Edit Video</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Video</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Title
            </label>

            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>

            <Textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Visibility
            </label>

            <Select
              value={visibility}
              onValueChange={(value) =>
                setVisibility(value as Visibility)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {selectedWorkspace === "personal" && (
                  <SelectItem value="PRIVATE">
                    Private
                  </SelectItem>
                )}
                <SelectItem value="PUBLIC">
                  Public
                </SelectItem>
                <SelectItem value="UNLISTED">
                  Unlisted
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {visibility !== VISIBILITY.PRIVATE && (
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

              {selectedWorkspace !== "personal" && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Workspace videos cannot be private.
                </p>
              )}
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">
              {error}
            </p>
          )}

          <Button
            className="w-full"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
