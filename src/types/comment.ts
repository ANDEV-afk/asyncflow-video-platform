export type CommentUser = {
  id: string;
  name: string;
  image: string | null | undefined;
};

export type CommentNode = {
  id: string;
  content: string;
  userId: string;
  videoId: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  replyCount: number;
  user: CommentUser;
  replies?: CommentNode[];
  isPending?: boolean;
};

export type CommentMutationResponse = {
  comment: CommentNode;
};
