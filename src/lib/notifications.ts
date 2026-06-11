import { prisma } from "@/lib/prisma";

export const NotificationType = {
  NEW_COMMENT: "NEW_COMMENT",
  MEMBER_JOINED: "MEMBER_JOINED",
  VIDEO_UPLOADED: "VIDEO_UPLOADED",
} as const;

export type NotificationTypeValue =
  (typeof NotificationType)[keyof typeof NotificationType];

type NotificationMetadata = {
  videoId?: string;
  videoTitle?: string;
  commentId?: string;
  actorId?: string;
  actorName?: string;
  workspaceName?: string;
};

export async function createNotificationsForMembers({
  type,
  workspaceId,
  actorId,
  metadata,
  excludeUserIds = [],
}: {
  type: NotificationTypeValue;
  workspaceId: string;
  actorId: string;
  metadata?: NotificationMetadata;
  excludeUserIds?: string[];
}) {
  const members = await prisma.workspaceMember.findMany({
    where: {
      workspaceId,
      userId: { notIn: [actorId, ...excludeUserIds] },
    },
    select: { userId: true },
  });

  if (members.length === 0) return;

  await prisma.notification.createMany({
    data: members.map((member) => ({
      type,
      userId: member.userId,
      workspaceId,
      metadata: metadata ?? undefined,
    })),
  });
}

export async function createNotification({
  type,
  userId,
  workspaceId,
  metadata,
}: {
  type: NotificationTypeValue;
  userId: string;
  workspaceId?: string | null;
  metadata?: NotificationMetadata;
}) {
  return prisma.notification.create({
    data: {
      type,
      userId,
      workspaceId: workspaceId ?? undefined,
      metadata: metadata ?? undefined,
    },
  });
}

export async function getUserNotifications(userId: string, limit = 30) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
}

export async function markNotificationRead(
  notificationId: string,
  userId: string
) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { userId: true },
  });

  if (!notification || notification.userId !== userId) {
    return null;
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
}

export function formatNotificationMessage(
  type: string,
  metadata: NotificationMetadata | null,
  workspaceName?: string | null
): string {
  const actor = metadata?.actorName ?? "Someone";
  const ws = workspaceName ?? metadata?.workspaceName ?? "a workspace";

  switch (type) {
    case NotificationType.VIDEO_UPLOADED:
      return `${actor} uploaded "${metadata?.videoTitle ?? "a video"}" in ${ws}`;
    case NotificationType.NEW_COMMENT:
      return `${actor} commented on "${metadata?.videoTitle ?? "a video"}"`;
    case NotificationType.MEMBER_JOINED:
      return `${actor} joined ${ws}`;
    default:
      return "New notification";
  }
}
