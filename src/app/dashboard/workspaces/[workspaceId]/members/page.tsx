import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import CreateInviteDialog from "@/components/workspaces/CreateInviteDialog";
import RemoveMemberButton from "@/components/workspaces/RemoveMemberButton";
import CancelInviteButton from "@/components/workspaces/CancelInviteButton";
import TransferOwnershipButton from "@/components/workspaces/TransferOwnershipButton";

export default async function WorkspaceMembersPage({
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
        members: {
          include: {
            user: true,
          },
        },
        invites: {
          include: {
            invitedUser: true,
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Members</h3>

        {isOwner && (
          <CreateInviteDialog
            workspaceId={workspace.id}
          />
        )}
      </div>

      <div className="rounded-lg border p-4">
        <div className="space-y-3">
          {workspace.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between"
            >
              <div>
                <span className="font-medium">
                  {member.user.name}
                </span>

                <span className="ml-2 rounded-full border px-2 py-0.5 text-xs">
                  {member.role}
                </span>
              </div>

              {isOwner &&
                member.role !== "OWNER" && (
                  <div className="flex gap-2">
                    <TransferOwnershipButton
                      workspaceId={workspace.id}
                      memberId={member.id}
                      memberName={
                        member.user.name
                      }
                    />

                    <RemoveMemberButton
                      workspaceId={workspace.id}
                      memberId={member.id}
                    />
                  </div>
                )}
            </div>
          ))}
        </div>
      </div>

      {isOwner && (
        <div className="rounded-lg border p-4">
          <h3 className="mb-4 font-semibold">
            Pending Invites
          </h3>

          {workspace.invites.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No pending invites
            </p>
          ) : (
            <div className="space-y-3">
              {workspace.invites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <span>
                      {invite.invitedUser.email}
                    </span>

                    <span className="ml-2 rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                      PENDING
                    </span>
                  </div>

                  <CancelInviteButton
                    inviteId={invite.id}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
