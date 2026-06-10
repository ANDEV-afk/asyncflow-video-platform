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

export default function TransferOwnershipButton({
  workspaceId,
  memberId,
  memberName,
}: {
  workspaceId: string;
  memberId: string;
  memberName: string;
}) {
  const router = useRouter();
  const [isTransferring, setIsTransferring] =
    useState(false);

  async function handleTransfer() {
    try {
      setIsTransferring(true);

      const response = await fetch(
        `/api/workspaces/${workspaceId}/transfer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            memberId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Failed to transfer ownership"
        );
      }

      toast.success(
        `Ownership transferred to ${memberName}`
      );
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to transfer ownership"
      );
    } finally {
      setIsTransferring(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline">
          Transfer Ownership
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Transfer Ownership
          </AlertDialogTitle>

          <AlertDialogDescription>
            {memberName} will become the workspace
            owner and you will become a member.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleTransfer}
            disabled={isTransferring}
          >
            {isTransferring
              ? "Transferring..."
              : "Transfer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
