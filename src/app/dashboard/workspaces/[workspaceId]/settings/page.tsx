import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import WorkspaceSettingsForm from "@/components/workspaces/WorkspaceSettingsForm";

export default async function WorkspaceSettingsPage({
  params,
}: {
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

  const isOwner = membership.role === "OWNER";

  if (!isOwner) {
    redirect(`/dashboard/workspaces/${workspaceId}`);
  }

  return (
    <WorkspaceSettingsForm
      workspaceId={workspace.id}
      name={workspace.name}
      description={workspace.description}
    />
  );
}
