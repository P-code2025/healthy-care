-- Add image columns to FoodLog for storing curated meal photos
ALTER TABLE "FoodLog"
  ADD COLUMN "imageUrl" TEXT,
  ADD COLUMN "imageAttribution" TEXT;
