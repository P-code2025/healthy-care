-- CreateTable
CREATE TABLE "ProgressPhoto" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "view" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgressPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProgressPhoto_userId_date_idx" ON "ProgressPhoto"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ProgressPhoto_userId_date_view_key" ON "ProgressPhoto"("userId", "date", "view");

-- AddForeignKey
ALTER TABLE "ProgressPhoto" ADD CONSTRAINT "ProgressPhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
