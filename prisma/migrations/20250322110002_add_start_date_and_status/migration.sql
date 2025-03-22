-- CreateEnum
CREATE TYPE "Status" AS ENUM ('not_started', 'active', 'restricted');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'not_started';
