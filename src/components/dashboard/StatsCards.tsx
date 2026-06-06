import {
  Clapperboard,
  MessageSquare,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type DashboardStats = {
  videos: number;
  workspaces: number;
  comments: number;
  aiNotes: number;
};

const dummyStats: DashboardStats = {
  videos: 0,
  workspaces: 0,
  comments: 0,
  aiNotes: 0,
};

const statItems: {
  key: keyof DashboardStats;
  label: string;
  icon: LucideIcon;
}[] = [
  { key: "videos", label: "Videos", icon: Clapperboard },
  { key: "workspaces", label: "Workspaces", icon: Users },
  { key: "comments", label: "Comments", icon: MessageSquare },
  { key: "aiNotes", label: "AI Notes", icon: Sparkles },
];

type StatsCardsProps = {
  stats?: DashboardStats;
};

export default function StatsCards({ stats = dummyStats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statItems.map((item) => (
        <Card key={item.key}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.label}
              </CardTitle>
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="size-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats[item.key]}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
