import { S3Client } from "@aws-sdk/client-s3";

const accessKeyId =
  process.env.AWS_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION;

if (!accessKeyId || !secretAccessKey || !region) {
  throw new Error(
    "Missing AWS credentials. Set AWS_ACCESS_KEY_ID (or AWS_ACCESS_KEY), AWS_SECRET_ACCESS_KEY, and AWS_REGION in .env"
  );
}

export const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});