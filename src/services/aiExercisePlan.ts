// src/services/aiExercisePlan.ts (mới)
import { http } from './http';

export interface AIExercisePlan {
  summary: string;
  intensity: "light" | "moderate" | "intense";
  exercises: { name: string; duration: string; reason: string }[];
  totalBurnEstimate: string;
  advice: string;
}

export async function generateAIExercisePlanFromAPI(
  dailyIntake: number,
  userQuery?: string
): Promise<AIExercisePlan> {
  try {
    const result = await http.post<AIExercisePlan>('/api/ai/exercise-plan', {
      dailyIntake,
      userQuery: userQuery || "Generate today's workout plan",
    });
    return result || createFallbackPlan();
  } catch (err) {
    console.error('Failed to generate AI exercise plan', err);
    return createFallbackPlan();
  }
}

function createFallbackPlan(): AIExercisePlan {
  return {
    summary: "Default suggestion: Stay active with light movement",
    intensity: "light",
    exercises: [
      { name: "Morning Yoga Flow", duration: "20 minutes", reason: "Gentle wake-up and mobility." },
      { name: "Brisk Walking", duration: "30 minutes", reason: "Light cardio to boost energy." },
    ],
    totalBurnEstimate: "250 kcal",
    advice: "Stay hydrated and warm up for 5 minutes before starting.",
  };
}