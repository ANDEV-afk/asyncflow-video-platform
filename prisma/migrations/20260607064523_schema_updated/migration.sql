-- AlterEnum
ALTER TYPE "Visibility" ADD VALUE 'UNLISTED';

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "videoUrl" TEXT;
