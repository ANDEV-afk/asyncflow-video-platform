import {
  Clapperboard,
  Eye,
  HardDrive,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type DashboardStats = {
  videos: number;
  views: number;
  storage: string;
  workspaces: number;
};

const statItems: {
  key: keyof DashboardStats;
  label: string;
  icon: LucideIcon;
  gradient: string;
}[] = [
  {
    key: "videos",
    label: "Videos",
    icon: Clapperboard,
    gradient: "from-violet-500/15 to-violet-500/5",
  },
  {
    key: "views",
    label: "Total Views",
    icon: Eye,
    gradient: "from-sky-500/15 to-sky-500/5",
  },
  {
    key: "storage",
    label: "Storage Used",
    icon: HardDrive,
    gradient: "from-amber-500/15 to-amber-500/5",
  },
  {
    key: "workspaces",
    label: "Workspaces",
    icon: Users,
    gradient: "from-emerald-500/15 to-emerald-500/5",
  },
];

type StatsCardsProps = {
  stats: DashboardStats;
};

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statItems.map((item) => (
        <Card
          key={item.key}
          className={`overflow-hidden border-0 bg-gradient-to-br ${item.gradient} shadow-sm`}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.label}
              </CardTitle>
              <div className="flex size-9 items-center justify-center rounded-xl bg-background/80 shadow-sm">
                <item.icon className="size-4 text-foreground/70" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight">
              {stats[item.key]}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
