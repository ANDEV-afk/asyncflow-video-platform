"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogTrigger} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function CreateWorkspaceDialog() {
  const router = useRouter();
  const [open,setOpen] = useState(false);
  const [name,setName] = useState("");
  const [description,setDescription] = useState("");
  const [isCreating,setisCreating] = useState(false);
  const [error,setError] = useState("");

  const handleCreation = async () => {
    try {
      setisCreating(true);
      setError("");
  
      const response = await fetch("/api/workspaces", {
        method: "POST",
        body: JSON.stringify({
          name,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ??"Failed to create the workspace")};
      setOpen(false); // now close dialog box
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error? error.message : "Something went wrong"
      );
    } finally {
      setisCreating(false); // if nothing works, then this block will run i.e. i am not creating this.
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
          <Button>
            Create Workspace
          </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Workspace here</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Name
            </label>

            <Input
              value={name}
              onChange={(e) =>
                setName(e.target.value)}/>
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

          {error && (<p className="text-sm text-destructive">{error}</p>)}

          <Button
            className="w-full"
            onClick={handleCreation}
            disabled={isCreating}
          >
            {isCreating? "Creating...": "Created"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
)
}