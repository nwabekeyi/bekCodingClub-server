-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentTaskId" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "currentTopicId" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "CodeQuery" (
    "id" SERIAL NOT NULL,
    "query" TEXT,
    "fileContent" TEXT,
    "fileNames" TEXT[],
    "criteria" TEXT NOT NULL,
    "score" INTEGER,
    "hints" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "CodeQuery_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CodeQuery" ADD CONSTRAINT "CodeQuery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
