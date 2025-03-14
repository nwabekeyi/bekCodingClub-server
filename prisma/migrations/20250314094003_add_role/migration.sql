-- CreateEnum
CREATE TYPE "Role" AS ENUM ('student', 'admin');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'student';
