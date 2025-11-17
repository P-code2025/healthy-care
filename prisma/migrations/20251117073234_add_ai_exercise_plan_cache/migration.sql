-- CreateTable
CREATE TABLE "AiExercisePlanCache" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "plan" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiExercisePlanCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiExercisePlanCache_userId_expiresAt_idx" ON "AiExercisePlanCache"("userId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "AiExercisePlanCache_userId_cacheKey_key" ON "AiExercisePlanCache"("userId", "cacheKey");

-- AddForeignKey
ALTER TABLE "AiExercisePlanCache" ADD CONSTRAINT "AiExercisePlanCache_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
