import { Users } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import EditWorkspaceDialog from "@/components/workspaces/EditWorkspaceDialog";

type Member = {
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  role: string;
};

type WorkspaceHeaderProps = {
  workspaceId: string;
  name: string;
  description: string | null;
  ownerName: string;
  members: Member[];
  isOwner: boolean;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function WorkspaceHeader({
  workspaceId,
  name,
  description,
  ownerName,
  members,
  isOwner,
}: WorkspaceHeaderProps) {
  const visibleMembers = members.slice(0, 5);
  const extraCount = Math.max(0, members.length - 5);

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-violet-500/8 via-card to-sky-500/8 p-6 shadow-sm md:p-8">
      <div className="absolute -top-16 -right-16 size-48 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="absolute -bottom-12 -left-12 size-40 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
              Workspace
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
              {name}
            </h2>
          </div>

          <p className="text-sm text-muted-foreground">
            Owner: <span className="font-medium text-foreground">{ownerName}</span>
          </p>

          {description ? (
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : (
            <p className="text-sm italic text-muted-foreground">
              No description provided.
            </p>
          )}

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {visibleMembers.map((member) => (
                <Avatar
                  key={member.user.id}
                  className="size-8 border-2 border-background"
                >
                  <AvatarFallback className="bg-gradient-to-br from-violet-500/80 to-sky-500/80 text-[10px] font-medium text-white">
                    {getInitials(member.user.name)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {extraCount > 0 && (
                <div className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium">
                  +{extraCount}
                </div>
              )}
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="size-3.5" />
              {members.length} member{members.length === 1 ? "" : "s"} here
            </span>
          </div>
        </div>

        {isOwner && (
          <EditWorkspaceDialog
            workspaceId={workspaceId}
            name={name}
            description={description}
            trigger={
              <Button variant="outline" className="shrink-0 rounded-full">
                Edit Workspace
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
