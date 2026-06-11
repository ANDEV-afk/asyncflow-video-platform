"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useCallback, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function MyVideosSearch() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const isMyVideos = pathname === "/dashboard/my-videos";
  const query = isMyVideos ? (searchParams.get("q") ?? "") : "";

  const updateQuery = useCallback(
    (value: string) => {
      if (!isMyVideos) return;
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }
      startTransition(() => {
        router.replace(`/dashboard/my-videos?${params.toString()}`);
      });
    },
    [isMyVideos, router, searchParams]
  );

  if (!isMyVideos) return null;

  return (
    <div className="relative mx-auto w-full max-w-lg px-2">
      <Search className="pointer-events-none absolute top-1/2 left-5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => updateQuery(e.target.value)}
        placeholder="Search by title or description..."
        className="h-9 rounded-full border-muted-foreground/15 bg-muted/40 pr-9 pl-10 text-sm shadow-sm transition-colors focus-visible:bg-background"
        disabled={isPending}
      />
      {query && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => updateQuery("")}
          className="absolute top-1/2 right-3 size-7 -translate-y-1/2 rounded-full text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
