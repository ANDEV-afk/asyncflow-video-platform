import { Visibility } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type WorkspaceResolveResult =
  | { workspaceId: string | null }
  | { error: string; status: number };

export async function resolveVideoWorkspaceId({
  visibility,
  workspaceId,
  userId,
}: {
  visibility: Visibility;
  workspaceId?: string | null;
  userId: string;
}): Promise<WorkspaceResolveResult> {
  if (visibility === Visibility.PRIVATE) {
    return { workspaceId: null };
  }

  if (!workspaceId) {
    return { workspaceId: null };
  }

  const membership =
    await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId,
      },
    });

  if (!membership) {
    return {
      error: "You are not a member of this workspace",
      status: 403,
    };
  }

  return { workspaceId };
}

export function isWorkspaceEligibleVisibility(
  visibility: Visibility
) {
  return (
    visibility === Visibility.PUBLIC ||
    visibility === Visibility.UNLISTED
  );
}
