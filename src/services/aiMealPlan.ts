import { http } from './http';

export interface Meal {
  name: string;
  calories: number;
  protein: number;
  image: string;
}

export interface DayPlan {
  day: string;
  date: string;
  breakfast?: Meal;
  lunch?: Meal;
  snack?: Meal;
  dinner?: Meal;
}

export interface AIMealPlanResponse {
  weeklyCalories: number;
  days: DayPlan[];
}

export async function generateAIMealPlan(
  allergies: string[],
  preferences: string
): Promise<AIMealPlanResponse> {
  const userRes = await http.get('/api/users/me');
  const user = userRes;

  const payload = {
    allergies,
    preferences,
    goal: user.goal || "maintain",
    weightKg: user.weight_kg,
    heightCm: user.height_cm,
    age: user.age,
    gender: user.gender || "Male",
    timestamp: Date.now(), // Force new generation each time
  };

  try {
    const result = await http.post<AIMealPlanResponse>('/api/ai/meal-plan', payload);
    return result;
  } catch (err) {
    console.error('AI Meal Plan failed', err);
    throw err;
  }
}