/*
  Warnings:

  - You are about to drop the column `status` on the `WorkspaceInvite` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WorkspaceInvite" DROP COLUMN "status";

-- DropEnum
DROP TYPE "InviteStatus";
