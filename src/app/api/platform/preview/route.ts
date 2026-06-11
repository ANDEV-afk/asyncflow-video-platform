import { NextResponse } from "next/server";

import { formatActivityMessage } from "@/lib/activity";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [memberCount, videoCount, commentCount, activities] =
      await Promise.all([
        prisma.workspaceMember.count(),
        prisma.video.count({
          where: { workspaceId: { not: null } },
        }),
        prisma.comment.count(),
        prisma.activity.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
          },
        }),
      ]);

    const activityItems = activities.map((activity) => ({
      id: activity.id,
      type: activity.type,
      message: formatActivityMessage(
        activity.type,
        activity.user.name,
        activity.metadata as Record<string, string> | null
      ),
      userName: activity.user.name,
      createdAt: activity.createdAt.toISOString(),
    }));

    return NextResponse.json({
      stats: {
        members: memberCount,
        videos: videoCount,
        comments: commentCount,
      },
      activities: activityItems,
      isLive: activities.length > 0,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        stats: { members: 0, videos: 0, comments: 0 },
        activities: [],
        isLive: false,
      },
      { status: 200 }
    );
  }
}
