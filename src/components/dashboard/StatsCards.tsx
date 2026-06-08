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
}[] = [
  { key: "videos", label: "Videos", icon: Clapperboard },
  { key: "views", label: "Total Views", icon: Eye },
  { key: "storage", label: "Storage Used", icon: HardDrive },
  { key: "workspaces", label: "Workspaces", icon: Users },
];

type StatsCardsProps = {
  stats: DashboardStats;
};

export default function StatsCards({ stats }: StatsCardsProps) {
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
