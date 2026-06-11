import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import {
  CommentError,
  createReplyComment,
  getCommentReplies,
} from "@/lib/comments";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  try {
    const { commentId } = await params;
    const replies = await getCommentReplies(commentId, session?.user?.id ?? null);

    return NextResponse.json({ replies });
  } catch (error) {
    if (error instanceof CommentError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error(error);
    return NextResponse.json(
      { error: "Failed to load replies" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { commentId } = await params;
    const body = await request.json().catch(() => ({}));

    const comment = await createReplyComment({
      commentId,
      userId: session.user.id,
      content: body.content,
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    if (error instanceof CommentError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error(error);
    return NextResponse.json(
      { error: "Failed to create reply" },
      { status: 500 }
    );
  }
}
