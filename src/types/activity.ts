export type ActivityItem = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  metadata: Record<string, unknown> | null;
};
