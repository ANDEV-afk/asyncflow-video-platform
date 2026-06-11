export type CommentSessionUser = {
  id: string;
  name: string;
  image: string | null;
};

export type CommentSession = {
  user: CommentSessionUser;
};