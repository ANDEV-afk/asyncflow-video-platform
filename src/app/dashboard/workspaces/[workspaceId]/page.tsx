import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import EditWorkspaceDialog from "@/components/workspaces/EditWorkspaceDialog";
import VideoCard from "@/components/videos/VideoCard";
import { addThumbnailUrls } from "@/lib/videos";
import { Button } from "@/components/ui/button";

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
          where: {
            visibility: {
              not: "PRIVATE",
            },
          },
          orderBy: {
            createdAt: "desc",
          },
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
  const owner = workspace.members.find(
    (member) => member.role === "OWNER"
  );

  const videosWithThumbnails =
    await addThumbnailUrls(workspace.videos);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Owner:{" "}
            {owner?.user.name ?? "Unknown"}
          </p>
        </div>

        {isOwner && (
          <EditWorkspaceDialog
            workspaceId={workspace.id}
            name={workspace.name}
            description={workspace.description}
            trigger={
              <Button variant="outline" size="sm">
                Edit
              </Button>
            }
          />
        )}
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="mb-2 font-semibold">
          Description
        </h3>

        <p className="text-muted-foreground">
          {workspace.description ||
            "No description provided."}
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="mb-4 font-semibold">
          Videos
        </h3>

        {workspace.videos.length === 0 ? (
          <p className="text-muted-foreground">
            No videos yet
          </p>
        ) : (
          <div className="grid grid-cols-4 space-x-4">
            {videosWithThumbnails.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
              />
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="mb-2 font-semibold">
          Created
        </h3>

        <p className="text-muted-foreground">
          {workspace.createdAt.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
