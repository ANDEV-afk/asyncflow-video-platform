"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
import { useState } from "react";

export default function RemoveMemberButton({
  workspaceId,
  memberId,
}: {
  workspaceId: string;
  memberId: string;
}) {
  const router = useRouter();
  const [isRemoving,setIsRemoving] = useState(false);

  async function handleRemove() {
    try {
      setIsRemoving(true);
      const response = await fetch(
        `/api/workspaces/${workspaceId}/members/${memberId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error();
      }

      toast.success("Member removed");

      router.refresh();
    } catch {
      toast.error("Failed to remove member");
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <AlertDialog>
    <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline">
          Remove
        </Button>
    </AlertDialogTrigger>

    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>
          Remove Member
        </AlertDialogTitle>

        <AlertDialogDescription>
          This action cannot be
          undone. The member will be
          permanently removed from
          storage and database.
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter>
        <AlertDialogCancel>
          Cancel
        </AlertDialogCancel>

        <AlertDialogAction
          onClick={handleRemove}
          disabled={isRemoving}
        >
          {isRemoving? "Removing...": "Remove"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
  );
}