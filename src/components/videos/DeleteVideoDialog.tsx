"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type DeleteVideoDialogProps = {
  videoId: string;
  trigger?: React.ReactNode;
};

export default function DeleteVideoDialog({videoId,trigger}: DeleteVideoDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] =useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/videos/${videoId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete video");
      }
      router.push(
        "/dashboard/my-videos"
      );

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to delete video");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button>
            Delete Video
          </Button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete Video
          </AlertDialogTitle>

          <AlertDialogDescription>
            This action cannot be
            undone. The video will be
            permanently removed from
            storage and database.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting? "Deleting...": "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}