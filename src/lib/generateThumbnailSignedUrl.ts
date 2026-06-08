import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { s3 } from "./s3";

export async function generateThumbnailSignedUrl(
  key: string
) {
  return getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket:
        process.env.AWS_BUCKET_NAME!,
      Key: key,
    }),
    {
      expiresIn: 3600,
    }
  );
}