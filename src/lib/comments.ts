import { Visibility } from "@/generated/prisma/client";

import { ActivityType, createActivity } from "@/lib/activity";
import {
  NotificationType,
  createNotification,
  createNotificationsForMembers,
} from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

import type { CommentNode } from "@/types/comment";

type CommentUserSelect = {
  id: true;
  name: true;
  image: true;
};

const commentUserSelect: CommentUserSelect = {
  id: true,
  name: true,
  image: true,
};

type VideoAccessRecord = {
  id: string;
  userId: string;
  visibility: Visibility;
};

type CommentRecord = {
  id: string;
  content: string;
  userId: string;
  videoId: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  _count?: {
    replies: number;
  };
};

export class CommentError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function serializeComment(comment: CommentRecord): CommentNode {
  return {
    id: comment.id,
    content: comment.content,
    userId: comment.userId,
    videoId: comment.videoId,
    parentId: comment.parentId,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    replyCount: comment._count?.replies ?? 0,
    user: comment.user,
  };
}

function normalizeContent(content: unknown): string {
  if (typeof content !== "string") {
    throw new CommentError("Comment content is required", 400);
  }

  const normalized = content.trim();

  if (!normalized) {
    throw new CommentError("Comment content is required", 400);
  }

  if (normalized.length > 4000) {
    throw new CommentError("Comment is too long", 400);
  }

  return normalized;
}

async function getVideoAccessRecord(videoId: string) {
  const video = await prisma.video.findUnique({
    where: {
      id: videoId,
    },
    select: {
      id: true,
      userId: true,
      visibility: true,
    },
  });

  if (!video) {
    throw new CommentError("Video not found", 404);
  }

  return video satisfies VideoAccessRecord;
}

function assertVideoAccess(
  video: VideoAccessRecord,
  userId: string | null | undefined
) {
  if (video.visibility === Visibility.PRIVATE && video.userId !== userId) {
    throw new CommentError("Forbidden", 403);
  }
}

async function getCommentParent(commentId: string) {
  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
    select: {
      id: true,
      videoId: true,
      parentId: true,
    },
  });

  if (!comment) {
    throw new CommentError("Comment not found", 404);
  }

  return comment;
}

async function createCommentRecord({
  content,
  userId,
  videoId,
  parentId,
}: {
  content: unknown;
  userId: string;
  videoId: string;
  parentId: string | null;
}) {
  const normalizedContent = normalizeContent(content);
  const video = await getVideoAccessRecord(videoId);
  assertVideoAccess(video, userId);

  if (parentId) {
    const parent = await getCommentParent(parentId);

    if (parent.videoId !== videoId) {
      throw new CommentError(
        "Parent comment does not belong to this video",
        400
      );
    }

    if (parent.parentId !== null) {
      throw new CommentError("Only one reply level is allowed", 400);
    }
  }

  const comment = await prisma.comment.create({
    data: {
      content: normalizedContent,
      userId,
      videoId,
      parentId,
    },
    include: {
      user: {
        select: commentUserSelect,
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
  });

  if (parentId === null) {
    const videoDetails = await prisma.video.findUnique({
      where: { id: videoId },
      select: {
        title: true,
        userId: true,
        workspaceId: true,
        workspace: { select: { name: true } },
      },
    });

    if (videoDetails) {
      const actor = comment.user;

      if (videoDetails.workspaceId) {
        await createActivity({
          type: ActivityType.COMMENT_ADDED,
          userId,
          workspaceId: videoDetails.workspaceId,
          metadata: {
            videoId,
            videoTitle: videoDetails.title,
            commentId: comment.id,
          },
        });

        await createNotificationsForMembers({
          type: NotificationType.NEW_COMMENT,
          workspaceId: videoDetails.workspaceId,
          actorId: userId,
          metadata: {
            videoId,
            videoTitle: videoDetails.title,
            commentId: comment.id,
            actorId: userId,
            actorName: actor.name,
            workspaceName: videoDetails.workspace?.name,
          },
        });
      } else if (videoDetails.userId !== userId) {
        await createNotification({
          type: NotificationType.NEW_COMMENT,
          userId: videoDetails.userId,
          metadata: {
            videoId,
            videoTitle: videoDetails.title,
            commentId: comment.id,
            actorId: userId,
            actorName: actor.name,
          },
        });
      }
    }
  }

  return serializeComment(comment);
}

export async function getVideoComments(
  videoId: string,
  userId: string | null | undefined = null
) {
  const video = await getVideoAccessRecord(videoId);
  assertVideoAccess(video, userId);

  const comments = await prisma.comment.findMany({
    where: {
      videoId,
      parentId: null,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: commentUserSelect,
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
  });

  return comments.map(serializeComment);
}

export async function getCommentReplies(
  commentId: string,
  userId: string | null | undefined = null
) {
  const parent = await getCommentParent(commentId);
  const video = await getVideoAccessRecord(parent.videoId);
  assertVideoAccess(video, userId);

  if (parent.parentId !== null) {
    throw new CommentError("Replies can only exist one level deep", 400);
  }

  const replies = await prisma.comment.findMany({
    where: {
      parentId: commentId,
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      user: {
        select: commentUserSelect,
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
  });

  return replies.map(serializeComment);
}

export async function getCommentById(commentId: string) {
  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
    include: {
      user: {
        select: commentUserSelect,
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
  });

  if (!comment) {
    return null;
  }

  return serializeComment(comment);
}

export async function createRootComment({
  videoId,
  userId,
  content,
}: {
  videoId: string;
  userId: string;
  content: unknown;
}) {
  return createCommentRecord({
    videoId,
    userId,
    content,
    parentId: null,
  });
}

export async function createReplyComment({
  commentId,
  userId,
  content,
}: {
  commentId: string;
  userId: string;
  content: unknown;
}) {
  const parent = await getCommentParent(commentId);

  if (parent.parentId !== null) {
    throw new CommentError("Only one reply level is allowed", 400);
  }

  return createCommentRecord({
    videoId: parent.videoId,
    userId,
    content,
    parentId: commentId,
  });
}

export async function updateCommentContent({
  commentId,
  userId,
  content,
}: {
  commentId: string;
  userId: string;
  content: unknown;
}) {
  const normalizedContent = normalizeContent(content);
  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!comment) {
    throw new CommentError("Comment not found", 404);
  }

  if (comment.userId !== userId) {
    throw new CommentError("Forbidden", 403);
  }

  const updatedComment = await prisma.comment.update({
    where: {
      id: commentId,
    },
    data: {
      content: normalizedContent,
    },
    include: {
      user: {
        select: commentUserSelect,
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
  });

  return serializeComment(updatedComment);
}

export async function deleteCommentContent({
  commentId,
  userId,
}: {
  commentId: string;
  userId: string;
}) {
  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!comment) {
    throw new CommentError("Comment not found", 404);
  }

  if (comment.userId !== userId) {
    throw new CommentError("Forbidden", 403);
  }

  await prisma.comment.delete({
    where: {
      id: commentId,
    },
  });

  return { success: true };
}

export async function getVideoById(videoId: string) {
  return prisma.video.findUnique({
    where: {
      id: videoId,
    },
    select: {
      id: true,
      userId: true,
      visibility: true,
    },
  });
}
