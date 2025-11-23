-- CreateTable
CREATE TABLE "DailyStatistics" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "totalCalories" INTEGER NOT NULL DEFAULT 0,
    "totalProtein" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCarbs" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalFat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "caloriesBurned" INTEGER NOT NULL DEFAULT 0,
    "exerciseDuration" INTEGER NOT NULL DEFAULT 0,
    "mealsCount" INTEGER NOT NULL DEFAULT 0,
    "workoutsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyStatistics_userId_date_idx" ON "DailyStatistics"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyStatistics_userId_date_key" ON "DailyStatistics"("userId", "date");
