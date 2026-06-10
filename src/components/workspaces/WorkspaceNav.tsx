"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  {
    label: "Overview",
    href: (workspaceId: string) =>
      `/dashboard/workspaces/${workspaceId}`,
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
    <nav className="flex gap-1 border-b">
      {tabs.map((tab) => {
        const href = tab.href(workspaceId);
        const isActive =
          pathname === href ||
          (tab.label === "Overview" &&
            pathname ===
              `/dashboard/workspaces/${workspaceId}`);

        return (
          <Link
            key={tab.label}
            href={href}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              isActive
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
