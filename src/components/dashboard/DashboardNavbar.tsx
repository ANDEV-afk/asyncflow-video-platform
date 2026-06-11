"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";
import { getDashboardPageTitle } from "@/components/dashboard/DashboardSidebar";
import MyVideosSearch from "@/components/videos/MyVideosSearch";
import {
  Bell,
  MessageSquare,
  Upload,
  UserPlus,
  Users,
} from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";

// Type definition for notification items (invites and notifications)
type NotificationItem = {
  id: string;
  kind: "invite" | "notification";
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  workspace?: { id: string; name: string; slug: string } | null;
  invitedBy?: { id: string; name: string; email: string };
  metadata?: Record<string, string> | null;
};

// Extract user initials from name or email for avatar display
function getInitials(name?: string | null, email?: string | null) {
  if (name?.trim()) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  return email?.[0]?.toUpperCase() ?? "U";
}

// Close menu when clicking outside the element
function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  onClose: () => void
) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onCloseRef.current();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [ref]);
}

// Return appropriate icon based on notification type
function getNotificationIcon(type: string) {
  switch (type) {
    case "VIDEO_UPLOADED":
      return Upload;
    case "NEW_COMMENT":
      return MessageSquare;
    case "MEMBER_JOINED":
      return UserPlus;
    case "WORKSPACE_INVITE":
      return Users;
    default:
      return Bell;
  }
}

// Notifications panel component - shows invites and activity updates
function NotificationsSheet() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load unread count on mount
  useEffect(() => {
    fetch("/api/notifications", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setUnreadCount(data.unreadCount);
      })
      .catch(() => {});
  }, []);

  // Fetch all notifications when panel is opened
  async function loadNotifications() {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setItems(data.items);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  // Accept workspace invite
  async function handleAccept(inviteId: string) {
    try {
      const res = await fetch(`/api/invites/${inviteId}/accept`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((item) => item.id !== inviteId));
      setUnreadCount((c) => Math.max(0, c - 1));
      toast.success("Workspace joined successfully");
    } catch {
      toast.error("Failed to accept invite");
    }
  }

  // Reject workspace invite
  async function handleReject(inviteId: string) {
    try {
      const res = await fetch(`/api/invites/${inviteId}/reject`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((item) => item.id !== inviteId));
      setUnreadCount((c) => Math.max(0, c - 1));
      toast.success("Invite rejected");
    } catch {
      toast.error("Failed to reject invite");
    }
  }

  // Mark notification as read
  async function markAsRead(notificationId: string) {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: "POST",
      });
      setItems((prev) =>
        prev.map((item) =>
          item.id === notificationId ? { ...item, read: true } : item
        )
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // silent
    }
  }

  async function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) await loadNotifications();
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative rounded-full">
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            Invites, comments, uploads, and team updates
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-3 overflow-y-auto px-4 py-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <Bell className="mx-auto size-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                No notifications yet
              </p>
            </div>
          ) : (
            items.map((item) => {
              const Icon = getNotificationIcon(item.type);
              return (
                <div
                  key={`${item.kind}-${item.id}`}
                  className={`rounded-xl border p-4 transition-colors ${
                    !item.read ? "border-violet-500/20 bg-violet-500/5" : ""
                  }`}
                  onClick={() => {
                    if (item.kind === "notification" && !item.read) {
                      markAsRead(item.id);
                    }
                  }}
                >
                  <div className="flex gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Icon className="size-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug">{item.message}</p>
                      {item.workspace && (
                        <Link
                          href={`/dashboard/workspaces/${item.workspace.id}`}
                          className="mt-1 inline-block text-xs text-violet-600 hover:underline"
                          onClick={() => setOpen(false)}
                        >
                          {item.workspace.name}
                        </Link>
                      )}
                      {item.kind === "invite" && (
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            className="h-7 rounded-full text-xs"
                            onClick={() => handleAccept(item.id)}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 rounded-full text-xs"
                            onClick={() => handleReject(item.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                      {item.kind === "notification" &&
                        item.metadata?.videoId && (
                          <Link
                            href={`/dashboard/my-videos/${item.metadata.videoId}`}
                            className="mt-1 inline-block text-xs text-violet-600 hover:underline"
                            onClick={() => setOpen(false)}
                          >
                            View video
                          </Link>
                        )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline" className="rounded-full">
              Close
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

type ProfileMenuProps = {
  name?: string | null;
  email?: string | null;
};

function ProfileMenu({ name, email }: ProfileMenuProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  useClickOutside(menuRef, () => setIsOpen(false));

  // Handle logout with immediate redirect to sign-in
  const handleLogout = async () => {
    await signOut();
    router.push("/sign-in");
  };

  return (
    <div ref={menuRef} className="relative">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => setIsOpen((open) => !open)}
        className="rounded-full"
        aria-label="Open profile menu"
      >
        {getInitials(name, email)}
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border bg-popover shadow-lg">
          <div className="border-b px-4 py-4">
            <p className="truncate text-sm font-medium">{name || "User"}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
          <div className="p-2">
            <Link
              href="/dashboard/settings"
              onClick={() => setIsOpen(false)}
              className="flex w-full rounded-xl px-3 py-2 text-sm transition-colors hover:bg-muted"
            >
              Profile
            </Link>
            <Link
              href="/dashboard/settings"
              onClick={() => setIsOpen(false)}
              className="flex w-full rounded-xl px-3 py-2 text-sm transition-colors hover:bg-muted"
            >
              Settings
            </Link>
            <Button
              type="button"
              variant="ghost"
              onClick={handleLogout}
              className="h-auto w-full justify-start px-3 py-2 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              Log out
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardNavbar() {
  // Get current page title and user session for navbar display
  const pathname = usePathname();
  const { data: session } = useSession();
  const pageTitle = getDashboardPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 grid h-16 shrink-0 grid-cols-[auto_1fr_auto] items-center gap-3 border-b bg-background/90 px-4 backdrop-blur-md supports-backdrop-filter:bg-background/75 md:gap-4 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger />
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-sm font-medium">{pageTitle}</p>
        </div>
      </div>

      <MyVideosSearch />

      <div className="flex items-center justify-end gap-2">
        <NotificationsSheet />
        <ProfileMenu
          name={session?.user?.name}
          email={session?.user?.email}
        />
      </div>
    </header>
  );
}
