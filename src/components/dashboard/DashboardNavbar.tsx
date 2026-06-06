"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";
import {
  dashboardNavItems,
  getDashboardPageTitle,
} from "@/components/dashboard/DashboardSidebar";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
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

export default function DashboardNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  const [search, setSearch] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const pageTitle = getDashboardPageTitle(pathname);

  const searchResults = dashboardNavItems.filter((item) => {
    const query = search.trim().toLowerCase();
    if (!query) return false;

    return item.title.toLowerCase().includes(query);
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }

      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function navigateToResult(href: string) {
    router.push(href);
    setSearch("");
    setShowSearchResults(false);
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && searchResults[0]) {
      navigateToResult(searchResults[0].href);
    }

    if (event.key === "Escape") {
      setShowSearchResults(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b bg-background/90 px-4 backdrop-blur-md supports-backdrop-filter:bg-background/75 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger />
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-sm font-medium">{pageTitle}</p>
        </div>
      </div>

      <div ref={searchRef} className="relative mx-auto hidden w-full max-w-md md:block">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setShowSearchResults(true);
          }}
          onFocus={() => setShowSearchResults(true)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search recordings..."
          className="h-10 bg-muted/50"
        />

        {showSearchResults && search.trim() && (
          <div className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-2xl border bg-popover shadow-lg">
            {searchResults.length > 0 ? (
              searchResults.map((item) => (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => navigateToResult(item.href)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-muted"
                >
                  <item.icon className="size-4 shrink-0 text-muted-foreground" />
                  {item.title}
                </button>
              ))
            ) : (
              <p className="px-4 py-3 text-sm text-muted-foreground">
                No recordings found
              </p>
            )}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
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

        <div ref={profileRef} className="relative">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setShowProfileMenu((open) => !open)}
            className="rounded-full"
            aria-label="Open profile menu"
          >
            {getInitials(user?.name, user?.email)}
          </Button>

          {showProfileMenu && (
            <div className="absolute top-full right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border bg-popover shadow-lg">
              <div className="border-b px-4 py-4">
                <p className="truncate text-sm font-medium">
                  {user?.name || "User"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </p>
              </div>
              <div className="p-2">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex w-full rounded-xl px-3 py-2 text-sm transition-colors hover:bg-muted"
                >
                  Profile
                </Link>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setShowProfileMenu(false)}
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
      </div>
    </header>
  );
}
