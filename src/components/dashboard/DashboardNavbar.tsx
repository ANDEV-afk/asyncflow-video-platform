"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";
import { getDashboardPageTitle } from "@/components/dashboard/DashboardSidebar";
import MyVideosSearch from "@/components/videos/MyVideosSearch";

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

// --- Helpers ---

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

// --- Sub-components ---

function NotificationsSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          Notifications
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            Your recent activity will appear here.
          </SheetDescription>
        </SheetHeader>

        <div className="px-4">
          <p className="text-sm text-muted-foreground">
            No notifications yet.
          </p>
        </div>

        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
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
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useClickOutside(menuRef, () => setIsOpen(false));

  function closeMenu() {
    setIsOpen(false);
  }

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
              onClick={closeMenu}
              className="flex w-full rounded-xl px-3 py-2 text-sm transition-colors hover:bg-muted"
            >
              Profile
            </Link>
            <Link
              href="/dashboard/settings"
              onClick={closeMenu}
              className="flex w-full rounded-xl px-3 py-2 text-sm transition-colors hover:bg-muted"
            >
              Settings
            </Link>
            <Button
              type="button"
              variant="ghost"
              onClick={() => signOut()}
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

// --- Main navbar ---

export default function DashboardNavbar() {
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
