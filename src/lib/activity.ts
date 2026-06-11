import { prisma } from "@/lib/prisma";

export const ActivityType = {
  VIDEO_UPLOADED: "VIDEO_UPLOADED",
  COMMENT_ADDED: "COMMENT_ADDED",
  MEMBER_JOINED: "MEMBER_JOINED",
} as const;

export type ActivityTypeValue =
  (typeof ActivityType)[keyof typeof ActivityType];

type ActivityMetadata = {
  videoId?: string;
  videoTitle?: string;
  commentId?: string;
  memberName?: string;
};

export async function createActivity({
  type,
  userId,
  workspaceId,
  metadata,
}: {
  type: ActivityTypeValue;
  userId: string;
  workspaceId: string;
  metadata?: ActivityMetadata;
}) {
  return prisma.activity.create({
    data: {
      type,
      userId,
      workspaceId,
      metadata: metadata ?? undefined,
    },
  });
}

export async function getWorkspaceActivities(
  workspaceId: string,
  limit = 20
) {
  let activities = await prisma.activity.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  if (activities.length === 0) {
    await backfillWorkspaceActivities(workspaceId);
    activities = await prisma.activity.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
  }

  return activities;
}

async function backfillWorkspaceActivities(workspaceId: string) {
  const [videos, comments, members] = await Promise.all([
    prisma.video.findMany({
      where: { workspaceId, visibility: { not: "PRIVATE" } },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, title: true, userId: true, createdAt: true },
    }),
    prisma.comment.findMany({
      where: { video: { workspaceId }, parentId: null },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        userId: true,
        videoId: true,
        createdAt: true,
        video: { select: { title: true } },
      },
    }),
    prisma.workspaceMember.findMany({
      where: { workspaceId },
      select: { userId: true },
    }),
  ]);

  const memberUserIds = new Set(members.map((m) => m.userId));

  const records: {
    type: ActivityTypeValue;
    userId: string;
    workspaceId: string;
    metadata?: ActivityMetadata;
    createdAt: Date;
  }[] = [];

  for (const video of videos) {
    records.push({
      type: ActivityType.VIDEO_UPLOADED,
      userId: video.userId,
      workspaceId,
      metadata: { videoId: video.id, videoTitle: video.title },
      createdAt: video.createdAt,
    });
  }

  for (const comment of comments) {
    if (!memberUserIds.has(comment.userId)) continue;
    records.push({
      type: ActivityType.COMMENT_ADDED,
      userId: comment.userId,
      workspaceId,
      metadata: {
        videoId: comment.videoId,
        videoTitle: comment.video.title,
        commentId: comment.id,
      },
      createdAt: comment.createdAt,
    });
  }

  for (const member of members) {
    records.push({
      type: ActivityType.MEMBER_JOINED,
      userId: member.userId,
      workspaceId,
      createdAt: new Date(),
    });
  }

  if (records.length === 0) return;

  await prisma.activity.createMany({
    data: records.slice(0, 20),
  });
}

export function formatActivityMessage(
  type: string,
  userName: string,
  metadata: ActivityMetadata | null
): string {
  switch (type) {
    case ActivityType.VIDEO_UPLOADED:
      return `${userName} uploaded a video${metadata?.videoTitle ? `: ${metadata.videoTitle}` : ""}`;
    case ActivityType.COMMENT_ADDED:
      return `${userName} commented on a video`;
    case ActivityType.MEMBER_JOINED:
      return `${userName} joined workspace`;
    default:
      return `${userName} performed an action`;
  }
}
