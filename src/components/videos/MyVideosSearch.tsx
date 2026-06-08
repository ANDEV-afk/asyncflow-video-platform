"use client";

import { usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMyVideosSearch } from "./MyVideosSearchContext";

export default function MyVideosSearch() {
  const pathname = usePathname();
  const { search, setSearch } = useMyVideosSearch();

  if (pathname !== "/dashboard/my-videos") return null;

  return (
    <div className="relative mx-auto w-full max-w-lg px-2">
      <Search className="pointer-events-none absolute top-1/2 left-5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search recordings..."
        className="h-9 rounded-full border-muted-foreground/15 bg-muted/40 pr-9 pl-10 text-sm shadow-sm transition-colors focus-visible:bg-background"
      />
      {search && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setSearch("")}
          className="absolute top-1/2 right-3 size-7 -translate-y-1/2 rounded-full text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
