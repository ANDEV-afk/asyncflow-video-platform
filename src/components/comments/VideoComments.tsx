"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Reply, Trash2, ChevronDown, ChevronUp, Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { CommentNode, CommentUser } from "@/types/comment";

let tempCommentCounter = 0;

function nextTempCommentId(prefix: string) {
  tempCommentCounter += 1;
  return `${prefix}-${tempCommentCounter}`;
}

type VideoCommentsProps = {
  videoId: string;
  initialComments: CommentNode[];
  currentUser: CommentUser | null;
};

type CommentItemProps = {
  comment: CommentNode;
  currentUserId: string | null;
  replies: CommentNode[];
  repliesLoaded: boolean;
  repliesOpen: boolean;
  level: number;
  onToggleReplies: () => void;
  onSubmitReply: (content: string) => Promise<void>;
  onSubmitEdit: (content: string) => Promise<void>;
  onDelete: () => Promise<void>;
};

function formatTimeAgo(isoDate: string) {
  const date = new Date(isoDate);
  const seconds = Math.max(
    1,
    Math.floor((Date.now() - date.getTime()) / 1000)
  );

  const ranges: Array<[number, Intl.RelativeTimeFormatUnit]> = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.34524, "week"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"],
  ];

  let remaining = seconds;
  for (const [amount, unit] of ranges) {
    if (remaining < amount) {
      return new Intl.RelativeTimeFormat("en", {
        numeric: "auto",
      }).format(-Math.max(1, Math.round(remaining)), unit);
    }
    remaining /= amount;
  }

  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(-1, "year");
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function CommentActions({
  isOwner,
  onEdit,
  onDelete,
}: {
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  if (!isOwner) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon-xs" onClick={onEdit}>
        <Pencil className="size-3.5" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon-xs">
            <Trash2 className="size-3.5" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the comment and any replies under it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CommentItem({
  comment,
  currentUserId,
  replies,
  repliesLoaded,
  repliesOpen,
  level,
  onToggleReplies,
  onSubmitReply,
  onSubmitEdit,
  onDelete,
}: CommentItemProps) {
  const isOwner = currentUserId === comment.userId;
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(comment.content);
  const [replyValue, setReplyValue] = useState("");
  const [replying, setReplying] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [savingReply, setSavingReply] = useState(false);
  const [error, setError] = useState("");

  const handleSaveEdit = async () => {
    const trimmed = editValue.trim();
    if (!trimmed) {
      setError("Comment content is required");
      return;
    }

    try {
      setSavingEdit(true);
      setError("");
      await onSubmitEdit(trimmed);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update comment");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleSubmitReply = async () => {
    const trimmed = replyValue.trim();
    if (!trimmed) {
      setError("Reply content is required");
      return;
    }

    try {
      setSavingReply(true);
      setError("");
      await onSubmitReply(trimmed);
      setReplyValue("");
      setReplying(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post reply");
    } finally {
      setSavingReply(false);
    }
  };

  return (
    <div className={cn("space-y-3", level > 0 && "pl-4 sm:pl-6")}>
      <div
        className={cn(
          "rounded-3xl border bg-background/80 p-4 shadow-sm",
          level > 0 && "border-dashed"
        )}
      >
        <div className="flex items-start gap-3">
          <Avatar className="size-10 shrink-0">
            {comment.user.image ? (
              <AvatarImage src={comment.user.image} alt={comment.user.name} />
            ) : null}
            <AvatarFallback>{getInitials(comment.user.name)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium leading-none">{comment.user.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatTimeAgo(comment.createdAt)}
              </span>
              {comment.isPending ? (
                <span className="text-xs text-muted-foreground">Sending...</span>
              ) : null}
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <Textarea
                  value={editValue}
                  onChange={(event) => setEditValue(event.target.value)}
                  className="min-h-24"
                />
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleSaveEdit} disabled={savingEdit}>
                    {savingEdit ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditValue(comment.content);
                      setError("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/90">
                {comment.content}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-full px-3 text-xs"
                onClick={() => setReplying((value) => !value)}
              >
                <Reply className="mr-1.5 size-3.5" />
                Reply
              </Button>

              {comment.replyCount > 0 || replies.length > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-full px-3 text-xs"
                  onClick={onToggleReplies}
                >
                  {repliesOpen ? (
                    <>
                      <ChevronUp className="mr-1.5 size-3.5" />
                      Hide replies
                    </>
                  ) : (
                    <>
                      <ChevronDown className="mr-1.5 size-3.5" />
                      {comment.replyCount} {comment.replyCount === 1 ? "reply" : "replies"}
                    </>
                  )}
                </Button>
              ) : null}

              <div className="ml-auto flex items-center gap-1">
                <CommentActions
                  isOwner={isOwner}
                  onEdit={() => {
                    setEditValue(comment.content);
                    setIsEditing(true);
                    setError("");
                  }}
                  onDelete={onDelete}
                />
              </div>
            </div>

            {error ? (
              <p className="text-xs text-destructive">{error}</p>
            ) : null}

            {replying ? (
              <div className="space-y-3 rounded-2xl border bg-muted/40 p-3">
                <Textarea
                  value={replyValue}
                  onChange={(event) => setReplyValue(event.target.value)}
                  placeholder="Write a reply..."
                  className="min-h-20 bg-background"
                />
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleSubmitReply} disabled={savingReply}>
                    {savingReply ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Replying...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 size-4" />
                        Reply
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setReplying(false);
                      setReplyValue("");
                      setError("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {repliesOpen ? (
        <div className="space-y-3">
          {!repliesLoaded ? (
            <div className="flex items-center gap-2 rounded-2xl border border-dashed px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading replies...
            </div>
          ) : replies.length > 0 ? (
            replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                currentUserId={currentUserId}
                replies={[]}
                repliesLoaded
                repliesOpen={false}
                level={level + 1}
                onToggleReplies={() => undefined}
                onSubmitReply={async () => {
                  throw new Error("Replies can only have one level");
                }}
                onSubmitEdit={onSubmitEdit}
                onDelete={onDelete}
              />
            ))
          ) : (
            <p className="rounded-2xl border border-dashed px-4 py-3 text-sm text-muted-foreground">
              No replies yet.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function VideoComments({
  videoId,
  initialComments,
  currentUser,
}: VideoCommentsProps) {
  const router = useRouter();
  const [comments, setComments] = useState<CommentNode[]>(initialComments);
  const [draft, setDraft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [replyState, setReplyState] = useState<
    Record<
      string,
      {
        replies: CommentNode[];
        loaded: boolean;
        open: boolean;
      }
    >
  >({});

  const commentCount = useMemo(() => comments.length, [comments.length]);

  const updateRootComment = (commentId: string, updater: (comment: CommentNode) => CommentNode) => {
    setComments((current) =>
      current.map((comment) =>
        comment.id === commentId ? updater(comment) : comment
      )
    );
  };

  const submitRootComment = async () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setFormError("Comment content is required");
      return;
    }

    if (!currentUser) {
      setFormError("Sign in to comment");
      return;
    }

    const tempId = nextTempCommentId("temp-comment");
    const pendingComment: CommentNode = {
      id: tempId,
      content: trimmed,
      userId: currentUser.id,
      videoId,
      parentId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replyCount: 0,
      user: currentUser,
      isPending: true,
    };

    setComments((current) => [pendingComment, ...current]);
    setDraft("");
    setIsSubmitting(true);
    setFormError("");

    try {
      const response = await fetch(`/api/videos/${videoId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: trimmed }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to post comment");
      }

      setComments((current) =>
        current.map((comment) =>
          comment.id === tempId ? payload.comment : comment
        )
      );
      router.refresh();
    } catch (error) {
      setComments((current) => current.filter((comment) => comment.id !== tempId));
      setFormError(error instanceof Error ? error.message : "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadReplies = async (commentId: string) => {
    const currentState = replyState[commentId];
    if (currentState?.loaded) {
      return;
    }

    setReplyState((current) => ({
      ...current,
      [commentId]: {
        replies: current[commentId]?.replies ?? [],
        loaded: false,
        open: true,
      },
    }));

    try {
      const response = await fetch(`/api/comments/${commentId}/replies`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load replies");
      }

      setReplyState((current) => ({
        ...current,
        [commentId]: {
          replies: payload.replies,
          loaded: true,
          open: true,
        },
      }));
    } catch (error) {
      setReplyState((current) => ({
        ...current,
        [commentId]: {
          replies: [],
          loaded: true,
          open: true,
        },
      }));
      throw error;
    }
  };

  const toggleReplies = async (commentId: string) => {
    const currentState = replyState[commentId];

    if (!currentState?.loaded) {
      await loadReplies(commentId);
      return;
    }

    setReplyState((current) => ({
      ...current,
      [commentId]: {
        replies: current[commentId]?.replies ?? [],
        loaded: true,
        open: !current[commentId]?.open,
      },
    }));
  };

  const submitReply = async (parentId: string, content: string) => {
    if (!currentUser) {
      throw new Error("Sign in to reply");
    }

    const tempId = nextTempCommentId("temp-reply");
    const pendingReply: CommentNode = {
      id: tempId,
      content,
      userId: currentUser.id,
      videoId,
      parentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replyCount: 0,
      user: currentUser,
      isPending: true,
    };

    setReplyState((current) => {
      const parentState = current[parentId] ?? {
        replies: [],
        loaded: true,
        open: true,
      };

      return {
        ...current,
        [parentId]: {
          ...parentState,
          replies: [pendingReply, ...parentState.replies],
          loaded: true,
          open: true,
        },
      };
    });
    updateRootComment(parentId, (comment) => ({
      ...comment,
      replyCount: comment.replyCount + 1,
    }));

    try {
      const response = await fetch(`/api/comments/${parentId}/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to post reply");
      }

      setReplyState((current) => {
        const parentState = current[parentId];
        if (!parentState) {
          return current;
        }

        return {
          ...current,
          [parentId]: {
            ...parentState,
            replies: parentState.replies.map((reply) =>
              reply.id === tempId ? payload.comment : reply
            ),
            loaded: true,
            open: true,
          },
        };
      });
      router.refresh();
    } catch (error) {
      setReplyState((current) => {
        const parentState = current[parentId];
        if (!parentState) {
          return current;
        }

        return {
          ...current,
          [parentId]: {
            ...parentState,
            replies: parentState.replies.filter((reply) => reply.id !== tempId),
            loaded: true,
            open: true,
          },
        };
      });
      updateRootComment(parentId, (comment) => ({
        ...comment,
        replyCount: Math.max(0, comment.replyCount - 1),
      }));
      throw error;
    }
  };

  const submitEdit = async (commentId: string, content: string) => {
    const rootComment = comments.find((comment) => comment.id === commentId);
    const replyEntry = Object.entries(replyState).find(([, state]) =>
      state.replies.some((reply) => reply.id === commentId)
    );

    const previousValue =
      rootComment?.content ??
      replyEntry?.[1].replies.find((reply) => reply.id === commentId)?.content ??
      "";

    if (rootComment) {
      setComments((current) =>
        current.map((comment) =>
          comment.id === commentId
            ? { ...comment, content, updatedAt: new Date().toISOString() }
            : comment
        )
      );
    }

    if (replyEntry) {
      const [parentId] = replyEntry;
      setReplyState((current) => {
        const parentState = current[parentId];
        if (!parentState) {
          return current;
        }

        return {
          ...current,
          [parentId]: {
            ...parentState,
            replies: parentState.replies.map((reply) =>
              reply.id === commentId
                ? { ...reply, content, updatedAt: new Date().toISOString() }
                : reply
            ),
          },
        };
      });
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to update comment");
      }

      if (rootComment) {
        setComments((current) =>
          current.map((comment) =>
            comment.id === commentId ? payload.comment : comment
          )
        );
      }

      if (replyEntry) {
        const [parentId] = replyEntry;
        setReplyState((current) => {
          const parentState = current[parentId];
          if (!parentState) {
            return current;
          }

          return {
            ...current,
            [parentId]: {
              ...parentState,
              replies: parentState.replies.map((reply) =>
                reply.id === commentId ? payload.comment : reply
              ),
            },
          };
        });
      }
    } catch (error) {
      if (rootComment) {
        setComments((current) =>
          current.map((comment) =>
            comment.id === commentId
              ? { ...comment, content: previousValue }
              : comment
          )
        );
      }

      if (replyEntry) {
        const [parentId] = replyEntry;
        setReplyState((current) => {
          const parentState = current[parentId];
          if (!parentState) {
            return current;
          }

          return {
            ...current,
            [parentId]: {
              ...parentState,
              replies: parentState.replies.map((reply) =>
                reply.id === commentId
                  ? { ...reply, content: previousValue }
                  : reply
              ),
            },
          };
        });
      }

      throw error;
    }
  };

  const deleteComment = async (commentId: string) => {
    const isReply = Object.entries(replyState).find(([, state]) =>
      state.replies.some((reply) => reply.id === commentId)
    );

    const rootSnapshot = comments.find((comment) => comment.id === commentId) ?? null;
    const replySnapshot = isReply
      ? isReply[1].replies.find((reply) => reply.id === commentId) ?? null
      : null;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to delete comment");
      }

      if (!isReply) {
        setComments((current) => current.filter((comment) => comment.id !== commentId));
        setReplyState((current) => {
          const next = { ...current };
          delete next[commentId];
          for (const key of Object.keys(next)) {
            next[key] = {
              ...next[key],
              replies: next[key].replies.filter((reply) => reply.id !== commentId),
            };
          }
          return next;
        });
      } else {
        const [parentId] = isReply;
        setReplyState((current) => {
          const parentState = current[parentId];
          if (!parentState) {
            return current;
          }

          return {
            ...current,
            [parentId]: {
              ...parentState,
              replies: parentState.replies.filter((reply) => reply.id !== commentId),
            },
          };
        });

        updateRootComment(parentId, (comment) => ({
          ...comment,
          replyCount: Math.max(0, comment.replyCount - 1),
        }));
      }

      return payload;
    } catch (error) {
      if (rootSnapshot) {
        setComments((current) => {
          const next = current.filter((comment) => comment.id !== commentId);
          return [rootSnapshot, ...next].sort(
            (left, right) =>
              new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
          );
        });
      }

      if (replySnapshot && isReply) {
        const [parentId] = isReply;
        setReplyState((current) => {
          const parentState = current[parentId];
          if (!parentState) {
            return current;
          }

          return {
            ...current,
            [parentId]: {
              ...parentState,
              replies: [...parentState.replies, replySnapshot],
            },
          };
        });
      }

      throw error;
    }
  };

  const renderComment = (
    comment: CommentNode,
    level: number = 0,
    overrideReplies?: CommentNode[]
  ) => {
    const state = replyState[comment.id] ?? {
      replies: overrideReplies ?? [],
      loaded: Boolean(overrideReplies),
      open: false,
    };

    return (
      <CommentItem
        key={comment.id}
        comment={comment}
        currentUserId={currentUser?.id ?? null}
        replies={state.replies}
        repliesLoaded={state.loaded}
        repliesOpen={state.open}
        level={level}
        onToggleReplies={() => {
          void toggleReplies(comment.id);
        }}
        onSubmitReply={async (content) => {
          await submitReply(comment.id, content);
        }}
        onSubmitEdit={async (content) => {
          await submitEdit(comment.id, content);
        }}
        onDelete={async () => {
          await deleteComment(comment.id);
        }}
      />
    );
  };

  return (
    <Card className="border-border/60 bg-background/95 shadow-lg backdrop-blur">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-lg">
          Comments <span className="text-muted-foreground">({commentCount})</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {currentUser ? (
          <div className="space-y-3 rounded-3xl border bg-muted/30 p-4">
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Add a public comment..."
              className="min-h-28 bg-background"
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Commenting as {currentUser.name}
              </p>
              <Button onClick={submitRootComment} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Comment"
                )}
              </Button>
            </div>
            {formError ? (
              <p className="text-sm text-destructive">{formError}</p>
            ) : null}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
            Sign in to leave a comment.
          </div>
        )}

        <Separator />

        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => renderComment(comment))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No comments yet. Be the first to comment.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
