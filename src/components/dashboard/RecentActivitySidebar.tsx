import Link from "next/link";
import {
  Building2,
  Clapperboard,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RecentVideo = {
  id: string;
  title: string;
  createdAt: Date;
};

type RecentComment = {
  id: string;
  content: string;
  createdAt: Date;
  video: { id: string; title: string };
  user: { name: string };
};

type RecentWorkspace = {
  id: string;
  name: string;
  joinedAt: Date;
};

type RecentActivitySidebarProps = {
  recentVideos: RecentVideo[];
  recentComments: RecentComment[];
  recentWorkspaces: RecentWorkspace[];
};

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 3600) return `${Math.max(1, Math.floor(seconds / 60))}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function SidebarSection({
  title,
  icon: Icon,
  children,
  emptyMessage,
  isEmpty,
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  emptyMessage: string;
  isEmpty: boolean;
}) {
  return (
    <Card className="border-0 bg-card/60 shadow-sm backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="size-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {isEmpty ? (
          <p className="text-xs text-muted-foreground">{emptyMessage}</p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

export default function RecentActivitySidebar({
  recentVideos,
  recentComments,
  recentWorkspaces,
}: RecentActivitySidebarProps) {
  return (
    <aside className="space-y-4">
      <SidebarSection
        title="Recent Videos"
        icon={Clapperboard}
        isEmpty={recentVideos.length === 0}
        emptyMessage="No videos recorded yet."
      >
        {recentVideos.map((video) => (
          <Link
            key={video.id}
            href={`/dashboard/my-videos/${video.id}`}
            className="block rounded-lg px-2 py-2 transition-colors hover:bg-muted/60"
          >
            <p className="line-clamp-1 text-sm font-medium">{video.title}</p>
            <p className="text-xs text-muted-foreground">
              {timeAgo(video.createdAt)}
            </p>
          </Link>
        ))}
      </SidebarSection>

      <SidebarSection
        title="Recent Comments"
        icon={MessageSquare}
        isEmpty={recentComments.length === 0}
        emptyMessage="No comments yet."
      >
        {recentComments.map((comment) => (
          <Link
            key={comment.id}
            href={`/dashboard/my-videos/${comment.video.id}`}
            className="block rounded-lg px-2 py-2 transition-colors hover:bg-muted/60"
          >
            <p className="line-clamp-1 text-sm">
              <span className="font-medium">{comment.user.name}</span>
              <span className="text-muted-foreground"> on </span>
              {comment.video.title}
            </p>
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {comment.content}
            </p>
          </Link>
        ))}
      </SidebarSection>

      <SidebarSection
        title="Recent Workspaces"
        icon={Building2}
        isEmpty={recentWorkspaces.length === 0}
        emptyMessage="No workspaces joined yet."
      >
        {recentWorkspaces.map((workspace) => (
          <Link
            key={workspace.id}
            href={`/dashboard/workspaces/${workspace.id}`}
            className="block rounded-lg px-2 py-2 transition-colors hover:bg-muted/60"
          >
            <p className="line-clamp-1 text-sm font-medium">{workspace.name}</p>
            <p className="text-xs text-muted-foreground">
              Joined {timeAgo(workspace.joinedAt)}
            </p>
          </Link>
        ))}
      </SidebarSection>
    </aside>
  );
}
