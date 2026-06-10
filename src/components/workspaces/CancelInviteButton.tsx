"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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

export default function CancelInviteButton({
  inviteId,
}: {
  inviteId: string;
}) {
  const router = useRouter();
  const [isCancelling, setIsCancelling] =
    useState(false);

  async function handleCancel() {
    try {
      setIsCancelling(true);

      const response = await fetch(
        `/api/invites/${inviteId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error();
      }

      toast.success("Invite cancelled");
      router.refresh();
    } catch {
      toast.error("Failed to cancel invite");
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline">
          Cancel
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Cancel Invite
          </AlertDialogTitle>

          <AlertDialogDescription>
            This will revoke the pending invite.
            The user will no longer be able to
            join this workspace using this
            invite.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>
            Keep Invite
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleCancel}
            disabled={isCancelling}
          >
            {isCancelling
              ? "Cancelling..."
              : "Cancel Invite"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
