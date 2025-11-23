-- AlterTable
ALTER TABLE "User" ADD COLUMN     "name" TEXT;

-- CreateTable
CREATE TABLE "AiFeedback" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "planSummary" TEXT NOT NULL,
    "planPayload" JSONB NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiFeedback_userId_createdAt_idx" ON "AiFeedback"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "AiFeedback" ADD CONSTRAINT "AiFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
