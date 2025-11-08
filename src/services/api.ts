// src/services/api.ts

export interface User {
  user_id: number;
  email: string;
  password_hash: string;
  age: number;
  gender: string;
  height_cm: number;
  weight_kg: number;
  goal: string;
  activity_level: string;
  exercise_preferences: {
    yoga: boolean;
    gym: boolean;
    [key: string]: boolean;
  };
}

export interface FoodLog {
  log_id: number;
  user_id: number;
  eaten_at: string;
  meal_type: string;
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  health_consideration: string;
  is_corrected: boolean;
}

export interface WorkoutLog {
  log_id: number;
  user_id: number;
  completed_at: string;
  exercise_name: string;
  duration_minutes: number;
  calories_burned_estimated: number;
  is_ai_suggested: boolean;
}

export interface AiSuggestion {
  suggestion_id: number;
  user_id: number;
  generated_at: string;
  type: string;
  is_applied: boolean;
  content_details: any;
}

const BASE_URL = "http://localhost:4000";

async function fetchData<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${BASE_URL}/${endpoint}`);
  if (!res.ok) throw new Error("API error");
  return res.json();
}

export const api = {
  getUsers: (): Promise<User[]> => fetchData<User[]>("users"),
  getFoodLog: (): Promise<FoodLog[]> => fetchData<FoodLog[]>("food_log"),
  getWorkoutLog: (): Promise<WorkoutLog[]> =>
    fetchData<WorkoutLog[]>("workout_log"),
  getAiSuggestions: (): Promise<AiSuggestion[]> =>
    fetchData<AiSuggestion[]>("ai_suggestions"),
};
