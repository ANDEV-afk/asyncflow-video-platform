"use client";

import Link from "next/link";
import { Workspace } from "@/generated/prisma/client";

type WorkspaceCardProps = {
  workspace: Workspace;
};

export default function WorkspaceCard({
  workspace,
}: WorkspaceCardProps) {
  return (
    <Link
      href={`/dashboard/workspaces/${workspace.id}`}
    >
      <div className="rounded-xl border p-5 transition hover:bg-muted hover:shadow-sm">
        <h3 className="font-semibold text-lg">
          {workspace.name}
        </h3>

        <p className="mt-2 text-sm text-muted-foreground">
          {workspace.description ||
            "No description"}
        </p>
      </div>
    </Link>
  );
}