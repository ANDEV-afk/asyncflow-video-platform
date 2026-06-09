import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import CreateInviteDialog from "@/components/workspaces/CreateInviteDialog";

export default async function WorkspacePage({params}: {
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
        members: {
          include: {
            user: true, // WHERE THIS MEMBER IS ALSO INCLUDED
          },
        },

        videos: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

  if (!workspace) {
    notFound();
  }

  const membership = workspace.members.find((member) =>member.userId === session.user.id); // so that after clicking on workspace other authorized members can access it.

  if (!membership) {
  notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <DashboardPageHeader
          title={workspace.name}
          description="Workspace Details"
        />
        <CreateInviteDialog workspaceId={workspace.id} />
      </div>

      {/* Description */}
      <div className="rounded-lg border p-4">
        <h3 className="font-semibold mb-2">
          Description
        </h3>

        <p className="text-muted-foreground">
          {workspace.description || "No description provided."}
        </p>
      </div>

      {/* Members */}
      <div className="rounded-lg border p-4">
        <h3 className="mb-4 font-semibold">
          Members
        </h3>

      <div className="space-y-3">
        {workspace.members.map(
          (member) => (
            <div
              key={member.id}
              className="flex items-center justify-between"
            >
              <span>
                {member.user.name}
              </span>

              <span className="rounded-full border px-2 py-1 text-xs">
                {member.role}
              </span>
            </div>
          )
        )}
      </div>
    </div>

    {/* Videos */}
    <div className="rounded-lg border p-4">
        <h3 className="mb-4 font-semibold">
          Videos
        </h3>

        {workspace.videos.length === 0 ? (
          <p className="text-muted-foreground">
            No videos yet
          </p>
        ) : (
          <div className="space-y-3">
            {workspace.videos.map( // RENDERING THE VIDEOS OF THE WORKSPACE
              (video) => (
                <div
                  key={video.id}
                  className="rounded border p-3"
                >
                  {video.title}
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Dates */}
      <div className="rounded-lg border p-4">
        <h3 className="font-semibold mb-2">
          Created
        </h3>

        <p className="text-muted-foreground">
          {workspace.createdAt.toLocaleString()}
        </p>
      </div>
    </div>
  );

}