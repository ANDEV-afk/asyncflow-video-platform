"use client";

import Link from "next/link";
import { Building2, ArrowRight } from "lucide-react";
import { Workspace } from "@/types/workspace";

type WorkspaceCardProps = {
  workspace: Workspace;
};

export default function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  return (
    <Link href={`/dashboard/workspaces/${workspace.id}`}>
      <div className="group rounded-2xl border bg-card p-5 shadow-sm transition-all hover:border-violet-500/30 hover:shadow-md">
        <div className="flex items-start justify-between">
          <div className="flex size-10 items-center justify-center rounded-xl bg-violet-500/10">
            <Building2 className="size-5 text-violet-600" />
          </div>
          <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <h3 className="mt-4 font-semibold text-lg">{workspace.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {workspace.description || "No description"}
        </p>
      </div>
    </Link>
  );
}
