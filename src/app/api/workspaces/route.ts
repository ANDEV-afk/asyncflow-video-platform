import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const {name,description} = body; 

    if (!name?.trim()) {
      return NextResponse.json(
        {
          error: "Workspace name required"
        },
        {status: 400}
      );
    }

    const slug = name.toLowerCase().trim().replace(/\s+/g,'-');

    const workspace = await prisma.$transaction( // 2 async as 2 nested db calls are happening at time.
      async (tx) => {
        const workspace = await tx.workspace.create({
          data: {
            name,
            slug,
            description,
            ownerId: session.user.id,
          },
        });

        await tx.workspaceMember.create({
          data: {
            workspaceId: workspace.id,
            userId: session.user.id,
            role: "OWNER",
          }
        });
        return workspace;
      }
    );
    return NextResponse.json(workspace);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Workspace not created"
      },
      {status: 500}
    )  
  };
};

export async function GET(){
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const memberships =
      await prisma.workspaceMember.findMany({
        where: {
          userId: session.user.id,
        },
        select: {
          workspace: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
            },
          },
        },
      });

    const workspaces = memberships.map(
      (membership) => membership.workspace
    );

    if (workspaces.length === 0) {
      return NextResponse.json([]) // findMany returns null here.
      };
    return NextResponse.json(workspaces);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Internal Server Error"
      },
      {status: 500}
    )  
  }
};