import { MessageSquare, Users, Video, type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type WorkspaceStatsProps = {
  members: number;
  videos: number;
  comments: number;
};

const statConfig: {
  key: keyof WorkspaceStatsProps;
  label: string;
  icon: LucideIcon;
  gradient: string;
}[] = [
  {
    key: "members",
    label: "Members",
    icon: Users,
    gradient: "from-violet-500/20 to-violet-500/5",
  },
  {
    key: "videos",
    label: "Videos",
    icon: Video,
    gradient: "from-sky-500/20 to-sky-500/5",
  },
  {
    key: "comments",
    label: "Comments",
    icon: MessageSquare,
    gradient: "from-emerald-500/20 to-emerald-500/5",
  },
];

export default function WorkspaceStats({
  members,
  videos,
  comments,
}: WorkspaceStatsProps) {
  const stats = { members, videos, comments };

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {statConfig.map((item) => (
        <Card
          key={item.key}
          className={`overflow-hidden border-0 bg-gradient-to-br ${item.gradient} shadow-sm`}
        >
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-1 text-3xl font-bold tracking-tight">
                {stats[item.key]}
              </p>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-background/80 shadow-sm">
              <item.icon className="size-5 text-foreground/70" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
