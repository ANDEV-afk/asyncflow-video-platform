"use client";

import { useState } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

type DownloadButtonProps = {
  videoId: string;
};

export default function DownloadButton({
  videoId,
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      const response = await fetch(
        `/api/videos/${videoId}/download`
      );

      if (!response.ok) {
        throw new Error("Failed to download");
      }

      const { url, filename } = await response.json(); // get the signed url and filename from the response.

      const link = document.createElement("a"); // create a new anchor element.
      link.href = url; // set the href of the anchor element to the signed url.
      link.download = filename; // set the download attribute of the anchor element to the filename.
      link.style.display = "none"; // set the display of the anchor element to none.
      document.body.appendChild(link); // append the anchor element to the body.
      link.click(); // click the anchor element.
      link.remove(); // remove the anchor element from the body.
    } catch (error) {
      console.error(error); // if there is an error, then log the error.
    } finally {
      setIsDownloading(false); // set the isDownloading state to false.
    }
  };

  return (
    <DropdownMenuItem
      onSelect={(e) => {
        e.preventDefault(); // prevent the default behavior of the dropdown menu item.
        handleDownload(); // handle the download.
      }}
      disabled={isDownloading} // disable the dropdown menu item if the video is downloading.
    >
      {isDownloading ? "Downloading..." : "Download"} 
    </DropdownMenuItem>
  );
}
