import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import CreateWorkspaceDialog from "@/components/workspaces/CreateWorkspaceDialog";
import WorkspaceCard from "@/components/workspaces/WorkspaceCard";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function WorkspacesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const workspaces =
    await prisma.workspaceMember.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        workspace: true,
      },
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <DashboardPageHeader
          title="Workspaces"
          description="Manage your team workspaces"
        />

        <CreateWorkspaceDialog />
      </div>

      {workspaces.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-muted/30 p-10 text-center">
          <h2 className="text-lg font-semibold">
            No workspaces yet
          </h2>

          <p className="mt-2 text-muted-foreground">
            Create your first workspace.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((member) => (
            <WorkspaceCard
              key={member.workspace.id}
              workspace={member.workspace}
            />
          ))}
        </div>
      )}
    </div>
  );
}