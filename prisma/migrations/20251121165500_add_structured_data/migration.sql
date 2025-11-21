-- AlterTable AddStructuredDataToChatMessage
ALTER TABLE "ChatMessage" ADD COLUMN "nutritionData" JSONB,
ADD COLUMN "exercisePlan" JSONB;
