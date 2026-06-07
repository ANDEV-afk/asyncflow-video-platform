import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { s3 } from '@/lib/s3';


export async function generateSignedUrl(
  s3Key:string,
  expiresIn = 3600 // after this this url expires, then generate new one.
) {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: s3Key,
  })
  const signedUrl = await getSignedUrl(
    s3,
    command,
    {
      expiresIn,
    }
  );

  return signedUrl;
}
