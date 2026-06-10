import { Video } from "@/generated/prisma/client";
import { generateThumbnailSignedUrl } from "./generateThumbnailSignedUrl";

export async function addThumbnailUrls(
  videos: Video[]
) {
  return Promise.all(
    videos.map(async (video) => ({
      ...video, // getting the whole video props but thumbnail from s3 as await below(same like myvideos page)

      thumbnailUrl:
        video.thumbnailKey
          ? await generateThumbnailSignedUrl(
              video.thumbnailKey
            )
          : null,
    }))
  );
}