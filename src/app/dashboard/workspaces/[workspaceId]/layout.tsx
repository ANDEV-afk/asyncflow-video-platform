import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import WorkspaceNav from "@/components/workspaces/WorkspaceNav";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const workspace =
    await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      include: {
        members: true,
      },
    });

  if (!workspace) {
    notFound();
  }

  const membership = workspace.members.find(
    (member) => member.userId === session.user.id
  );

  if (!membership) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={workspace.name}
        description="Workspace"
      />

      <WorkspaceNav workspaceId={workspaceId} />

      {children}
    </div>
  );
}
