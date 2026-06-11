import {
  MessageSquare,
  Upload,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

import { ActivityType, formatActivityMessage } from "@/lib/activity";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type ActivityRecord = {
  id: string;
  type: string;
  createdAt: Date;
  metadata: unknown;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
};

const activityIcons: Record<string, LucideIcon> = {
  [ActivityType.VIDEO_UPLOADED]: Upload,
  [ActivityType.COMMENT_ADDED]: MessageSquare,
  [ActivityType.MEMBER_JOINED]: UserPlus,
};

const activityColors: Record<string, string> = {
  [ActivityType.VIDEO_UPLOADED]: "bg-violet-500/10 text-violet-600",
  [ActivityType.COMMENT_ADDED]: "bg-sky-500/10 text-sky-600",
  [ActivityType.MEMBER_JOINED]: "bg-emerald-500/10 text-emerald-600",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

type ActivityFeedProps = {
  activities: ActivityRecord[];
};

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/30 p-8 text-center">
        <p className="text-sm font-medium">No activity yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a video or invite members to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const Icon = activityIcons[activity.type] ?? Upload;
        const colorClass =
          activityColors[activity.type] ?? "bg-muted text-muted-foreground";
        const metadata = activity.metadata as Record<string, string> | null;

        return (
          <div
            key={activity.id}
            className="flex items-start gap-3 rounded-xl border bg-card/50 p-4 transition-colors hover:bg-card"
          >
            <Avatar className="size-9 shrink-0">
              <AvatarFallback className="text-xs font-medium">
                {getInitials(activity.user.name)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug">
                {formatActivityMessage(
                  activity.type,
                  activity.user.name,
                  metadata
                )}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {timeAgo(activity.createdAt)}
              </p>
            </div>

            <div
              className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${colorClass}`}
            >
              <Icon className="size-4" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
