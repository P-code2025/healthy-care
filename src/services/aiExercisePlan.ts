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
      userQuery,
    });
    return result || createFallbackPlan();
  } catch (err) {
    console.error('Failed to generate AI exercise plan from server', err);
    return createFallbackPlan();
  }
}

function createFallbackPlan(): AIExercisePlan {
  return {
    summary: "Gợi ý mặc định: giữ nhẹ nhàng và tập trung vào vận động",
    intensity: "light",
    exercises: [
      { name: "Morning Yoga Flow", duration: "20 phút", reason: "Giãn cơ và khởi động ngày mới." },
      { name: "Đi bộ nhanh", duration: "30 phút", reason: "Cardio nhẹ nhàng để cân bằng năng lượng." },
    ],
    totalBurnEstimate: "250 kcal",
    advice: "Uống đủ nước và khởi động 5 phút trước khi tập.",
  };
}