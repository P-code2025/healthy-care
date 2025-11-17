-- CreateTable
CREATE TABLE "AiMealPlanCache" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "plan" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiMealPlanCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiMealPlanCache_userId_cacheKey_key" ON "AiMealPlanCache"("userId", "cacheKey");

-- AddForeignKey
ALTER TABLE "AiMealPlanCache" ADD CONSTRAINT "AiMealPlanCache_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
