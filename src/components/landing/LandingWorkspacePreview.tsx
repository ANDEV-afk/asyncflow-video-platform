"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Sparkles,
  Upload,
  UserPlus,
  Users,
  Video,
} from "lucide-react";

type PreviewData = {
  stats: { members: number; videos: number; comments: number };
  activities: {
    id: string;
    type: string;
    message: string;
    userName: string;
    createdAt: string;
  }[];
  isLive: boolean;
};

const fallbackActivities = [
  {
    id: "demo-1",
    type: "VIDEO_UPLOADED",
    message: "Anant uploaded a video: Sprint demo",
    userName: "Anant",
    dot: "bg-emerald-500",
    icon: Upload,
  },
  {
    id: "demo-2",
    type: "COMMENT_ADDED",
    message: "Raj commented on a video",
    userName: "Raj",
    dot: "bg-sky-500",
    icon: MessageSquare,
  },
  {
    id: "demo-3",
    type: "MEMBER_JOINED",
    message: "Aman joined workspace",
    userName: "Aman",
    dot: "bg-violet-500",
    icon: UserPlus,
  },
];

const activityMeta: Record<
  string,
  { dot: string; icon: typeof Upload }
> = {
  VIDEO_UPLOADED: { dot: "bg-emerald-500", icon: Upload },
  COMMENT_ADDED: { dot: "bg-sky-500", icon: MessageSquare },
  MEMBER_JOINED: { dot: "bg-violet-500", icon: UserPlus },
};

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) {
      setDisplay(0);
      return;
    }

    const duration = 800;
    const steps = 20;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step += 1;
      current = Math.min(value, Math.round(increment * step));
      setDisplay(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <>{display}</>;
}

export default function LandingWorkspacePreview() {
  const [data, setData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/platform/preview")
      .then((res) => res.json())
      .then((json: PreviewData) => setData(json))
      .catch(() =>
        setData({
          stats: { members: 5, videos: 23, comments: 85 },
          activities: [],
          isLive: false,
        })
      )
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats ?? { members: 0, videos: 0, comments: 0 };
  const liveActivities = data?.activities ?? [];
  const showLive = data?.isLive && liveActivities.length > 0;

  const statCards = [
    {
      label: "Members",
      value: stats.members,
      icon: Users,
      gradient: "from-violet-500/20 to-violet-500/5",
    },
    {
      label: "Videos",
      value: stats.videos,
      icon: Video,
      gradient: "from-sky-500/20 to-sky-500/5",
    },
    {
      label: "Comments",
      value: stats.comments,
      icon: MessageSquare,
      gradient: "from-emerald-500/20 to-emerald-500/5",
    },
  ];

  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-violet-500/20 via-transparent to-sky-500/20 blur-2xl" />

      <div className="relative overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-violet-500/10">
        <div className="flex items-center justify-between border-b bg-muted/40 px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-sky-500 text-xs font-bold text-white">
              A
            </div>
            <div>
              <p className="text-sm font-semibold">Product Team</p>
              <p className="text-[10px] text-muted-foreground">Workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`size-2 rounded-full ${showLive ? "animate-pulse bg-emerald-500" : "bg-amber-500"}`}
            />
            <span className="text-[10px] font-medium text-muted-foreground">
              {showLive ? "Live from platform" : "Platform preview"}
            </span>
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div className="grid grid-cols-3 gap-3">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className={`rounded-xl bg-gradient-to-br ${stat.gradient} p-3 text-center`}
              >
                <div className="mx-auto mb-1 flex size-7 items-center justify-center rounded-lg bg-background/80">
                  <stat.icon className="size-3.5 text-foreground/70" />
                </div>
                <p className="text-xl font-bold">
                  {loading ? "—" : <AnimatedNumber value={stat.value} />}
                </p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Recent Activity
              </p>
              {showLive && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                  <Sparkles className="size-3" />
                  Real data
                </span>
              )}
            </div>

            <div className="space-y-2">
              {showLive
                ? liveActivities.slice(0, 3).map((activity) => {
                    const meta =
                      activityMeta[activity.type] ?? activityMeta.VIDEO_UPLOADED;
                    const Icon = meta.icon;
                    return (
                      <div
                        key={activity.id}
                        className="flex items-center gap-3 rounded-xl border bg-background p-3 shadow-sm transition-all hover:border-violet-500/20"
                      >
                        <div className={`size-2 shrink-0 rounded-full ${meta.dot}`} />
                        <p className="min-w-0 flex-1 text-sm leading-snug">
                          {activity.message}
                        </p>
                        <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                      </div>
                    );
                  })
                : fallbackActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-3 rounded-xl border bg-background p-3 shadow-sm"
                    >
                      <div
                        className={`size-2 shrink-0 rounded-full ${activity.dot}`}
                      />
                      <p className="text-sm">
                        <span className="font-medium">{activity.userName}</span>{" "}
                        {activity.message.split(" ").slice(1).join(" ")}
                      </p>
                    </div>
                  ))}
            </div>
          </div>
        </div>

        <div className="border-t bg-muted/30 px-5 py-3 text-center">
          <Link
            href="/sign-up"
            className="text-xs font-medium text-violet-600 hover:underline"
          >
            Create your workspace to see this live →
          </Link>
        </div>
      </div>
    </div>
  );
}
