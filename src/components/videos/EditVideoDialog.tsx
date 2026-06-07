"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Video, Visibility } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogTrigger} from "@/components/ui/dialog";
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

export default function EditVideoDialog({video,trigger}: EditVideoDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description ?? "");
  const [visibility, setVisibility] = useState<Visibility>(video.visibility);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError("");

      const response = await fetch(`/api/videos/${video.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            title,
            description,
            visibility,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ??"Failed to update video")};
      setOpen(false);

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            Edit Video
          </Button>
        )}
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
              onChange={(e) =>
                setTitle(e.target.value)}/>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>

            <Textarea
              value={description}
              onChange={(e) =>setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Visibility
            </label>

            <Select
              value={visibility}
              onValueChange={(value) => setVisibility(value as Visibility)} // only enum type possible.
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="PRIVATE">Private</SelectItem>
                <SelectItem value="PUBLIC">Public</SelectItem>
                <SelectItem value="UNLISTED">Unlisted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && (<p className="text-sm text-destructive">{error}</p>)}

          <Button
            className="w-full"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving? "Saving...": "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}