/*
  Warnings:

  - You are about to drop the column `thumbnailUrl` on the `Video` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Video" DROP COLUMN "thumbnailUrl",
ADD COLUMN     "thumbnailKey" TEXT;
