/*
  Warnings:

  - You are about to drop the column `currentTaskId` on the `User` table. All the data in the column will be lost.
  - You are about to alter the column `progress` on the `User` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `averageScore` on the `User` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "currentTaskId",
ADD COLUMN     "lastTaskId" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalScore" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "progress" SET DEFAULT 0,
ALTER COLUMN "progress" SET DATA TYPE INTEGER,
ALTER COLUMN "averageScore" SET DEFAULT 0,
ALTER COLUMN "averageScore" SET DATA TYPE INTEGER;
