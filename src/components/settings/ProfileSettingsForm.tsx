"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Mail, Pencil, User, X } from "lucide-react";
import { toast } from "sonner";

import { updateUser, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function getInitials(name?: string | null) {
  if (!name?.trim()) return "U";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ProfileSettingsForm() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  function handleCancel() {
    setName(user?.name ?? "");
    setEditing(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Name cannot be empty");
      return;
    }

    if (trimmed === user?.name) {
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      const res = await updateUser({ name: trimmed });

      if (res.error) {
        toast.error(res.error.message ?? "Failed to update profile");
        return;
      }

      toast.success("Profile updated");
      setEditing(false);
      router.refresh();
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  if (isPending) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <Card className="border-0 bg-gradient-to-br from-violet-500/10 via-card to-sky-500/10 shadow-sm">
        <CardContent className="flex flex-col items-center p-6 text-center">
          <Avatar className="size-20 border-4 border-background shadow-lg">
            <AvatarFallback className="bg-gradient-to-br from-violet-600 to-sky-500 text-xl font-bold text-white">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
          <h2 className="mt-4 text-lg font-semibold">{user?.name ?? "User"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
          <div className="mt-4 rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
            Async AI member
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>Profile details</CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </div>
          {!editing && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setEditing(true)}
            >
              <Pencil className="mr-1.5 size-3.5" />
              Edit
            </Button>
          )}
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid gap-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="size-3.5 text-muted-foreground" />
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                readOnly={!editing}
                className={`h-11 rounded-xl ${!editing ? "cursor-default bg-muted/50" : ""}`}
                placeholder="Your name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="size-3.5 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={user?.email ?? ""}
                readOnly
                className="h-11 cursor-default rounded-xl bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed here. Contact support if needed.
              </p>
            </div>

            {editing && (
              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={saving}
                  className="rounded-full"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X className="mr-1.5 size-3.5" />
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Camera className="size-4 text-muted-foreground" />
            Account
          </CardTitle>
          <CardDescription>
            Your account is secured with email and password authentication.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
