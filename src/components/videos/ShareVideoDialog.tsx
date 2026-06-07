"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "../ui/dialog";

type ShareVideoProps = {
  videoId: string,
  shareId: string,
}

export default function ShareVideoDialog({ videoId, shareId }: ShareVideoProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [copied,setCopied] = useState(false);

  const handleShare = async () => {
    try {
      setIsSharing(true); // now sharing is in progress.

      await fetch(
        `/api/videos/${videoId}/share`, // share api to generate share id.
        {
          method: "PATCH",
        }
      );

      const shareUrl =
        `${window.location.origin}/share/${shareId}`; // this is the url that will be shared.

      await navigator.clipboard.writeText(
        shareUrl
      ); // it will copy the url to clipboard.

      setCopied(true); // now copied is true.
    } catch (error) {
      console.error(error);
    } finally {
      setIsSharing(false); // now sharing is false.
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          Share
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Share Video
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This will make your
            video unlisted and copy
            a shareable link.
          </p>

          <Button
            className="w-full"
            onClick={handleShare}
            disabled={isSharing}
          >
            {isSharing? "Generating...": copied? "Copied!": "Copy Share Link"} {/* if sharing is in progress, then show generating... else if copied is true, then show copied! else show copy share link. */}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}