"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  {
    label: "Overview",
    href: (workspaceId: string) => `/dashboard/workspaces/${workspaceId}`,
  },
  {
    label: "Members",
    href: (workspaceId: string) =>
      `/dashboard/workspaces/${workspaceId}/members`,
  },
  {
    label: "Settings",
    href: (workspaceId: string) =>
      `/dashboard/workspaces/${workspaceId}/settings`,
  },
];

export default function WorkspaceNav({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 rounded-xl border bg-muted/40 p-1">
      {tabs.map((tab) => {
        const href = tab.href(workspaceId);
        const isActive =
          pathname === href ||
          (tab.label === "Overview" &&
            pathname === `/dashboard/workspaces/${workspaceId}`);

        return (
          <Link
            key={tab.label}
            href={href}
            className={cn(
              "flex-1 rounded-lg px-4 py-2 text-center text-sm font-medium transition-all sm:flex-none sm:text-left",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
