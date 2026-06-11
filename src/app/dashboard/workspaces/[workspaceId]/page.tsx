import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import ActivityFeed from "@/components/workspaces/ActivityFeed";
import WorkspaceStats from "@/components/workspaces/WorkspaceStats";
import WorkspaceHeader from "@/components/workspaces/WorkspaceHeader";
import WorkspaceVideosSection from "@/components/workspaces/WorkspaceVideosSection";
import { addThumbnailUrls } from "@/lib/videos";
import { getWorkspaceActivities } from "@/lib/activity";

export default async function WorkspacePage({
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

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: {
        include: { user: true },
      },
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
  const owner = workspace.members.find((member) => member.role === "OWNER");

  const [memberCount, videoCount, commentCount, videos, activities] =
    await Promise.all([
      prisma.workspaceMember.count({ where: { workspaceId } }),
      prisma.video.count({
        where: {
          workspaceId,
          visibility: { not: "PRIVATE" },
        },
      }),
      prisma.comment.count({
        where: {
          video: { workspaceId },
        },
      }),
      prisma.video.findMany({
        where: {
          workspaceId,
          visibility: { not: "PRIVATE" },
        },
        orderBy: { createdAt: "desc" },
      }),
      getWorkspaceActivities(workspaceId, 15),
    ]);

  const videosWithThumbnails = await addThumbnailUrls(videos);

  return (
    <div className="space-y-8">
      <WorkspaceHeader
        workspaceId={workspace.id}
        name={workspace.name}
        description={workspace.description}
        ownerName={owner?.user.name ?? "Unknown"}
        members={workspace.members}
        isOwner={isOwner}
      />

      <WorkspaceStats
        members={memberCount}
        videos={videoCount}
        comments={commentCount}
      />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <WorkspaceVideosSection
          videos={videosWithThumbnails}
          totalCount={videoCount}
        />

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-2xl border bg-card/50 p-5">
            <h2 className="font-semibold tracking-tight">Recent Activity</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Latest updates from your team
            </p>
            <div className="mt-4">
              <ActivityFeed activities={activities} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
