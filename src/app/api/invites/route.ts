import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request:NextRequest) {
  const session =await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

  try {
    const invites = await prisma.workspaceInvite.findMany({ // if multiple invites i received for that get request.
        where: {
          invitedUserId:session.user.id, // if multiple invites are in table then for my userid give me.
          status: "PENDING",
        },

        include: {
          workspace: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },

          invitedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc", // recent ones upar in notification list.
        },
      });

    return NextResponse.json(
      invites
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {error:"Failed to fetch invites",},
      {status: 500}
    );
  }
}