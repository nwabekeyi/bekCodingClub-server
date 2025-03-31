-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'completed';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "certificateUrl" TEXT NOT NULL DEFAULT '';
