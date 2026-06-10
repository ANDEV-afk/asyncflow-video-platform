"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import DeleteWorkspaceDialog from "@/components/workspaces/DeleteWorkspaceDialog";

type WorkspaceSettingsFormProps = {
  workspaceId: string;
  name: string;
  description: string | null;
};

export default function WorkspaceSettingsForm({
  workspaceId,
  name: initialName,
  description: initialDescription,
}: WorkspaceSettingsFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(
    initialDescription ?? ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    try {
      setIsSaving(true);
      setError("");

      const response = await fetch(
        `/api/workspaces/${workspaceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            description,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Failed to update workspace"
        );
      }

      toast.success("Settings saved");
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
  }

  return (
    <div className="space-y-8">
      <div className="rounded-lg border p-4 space-y-4">
        <h3 className="font-semibold">
          Workspace Details
        </h3>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Workspace Name
          </label>

          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
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

        {error && (
          <p className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="rounded-lg border border-destructive/50 p-4">
        <h3 className="font-semibold text-destructive">
          Danger Zone
        </h3>

        <p className="mt-2 text-sm text-muted-foreground">
          Permanently delete this workspace and
          all associated data.
        </p>

        <div className="mt-4">
          <DeleteWorkspaceDialog
            workspaceId={workspaceId}
            workspaceName={name}
          />
        </div>
      </div>
    </div>
  );
}
