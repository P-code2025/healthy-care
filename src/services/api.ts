// src/services/api.ts

import { http } from "./http";

export interface User {
  user_id: number;
  email: string;
  password_hash: string;
  name: string;
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

export interface DailyStatistics {
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  calories_burned: number;
  exercise_duration: number;
  meals_count: number;
  workouts_count: number;
}

type UserUpdatePayload = Partial<
  Omit<User, "user_id" | "email" | "password_hash">
> & {
  heightCm?: number;
  weightKg?: number;
  activityLevel?: string;
  exercisePreferences?: User["exercise_preferences"];
};

const normalizeUserUpdatePayload = (data: UserUpdatePayload) => {
  const payload: Record<string, unknown> = {};

  const assign = (key: keyof UserUpdatePayload, targetKey?: string) => {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      payload[targetKey ?? (key as string)] = data[key];
    }
  };

  assign("age");
  assign("gender");
  assign("goal");

  if (
    Object.prototype.hasOwnProperty.call(data, "heightCm") ||
    Object.prototype.hasOwnProperty.call(data, "height_cm")
  ) {
    payload.heightCm =
      Object.prototype.hasOwnProperty.call(data, "heightCm") &&
      data.heightCm !== undefined
        ? data.heightCm
        : data.height_cm;
  }

  if (
    Object.prototype.hasOwnProperty.call(data, "weightKg") ||
    Object.prototype.hasOwnProperty.call(data, "weight_kg")
  ) {
    payload.weightKg =
      Object.prototype.hasOwnProperty.call(data, "weightKg") &&
      data.weightKg !== undefined
        ? data.weightKg
        : data.weight_kg;
  }

  if (
    Object.prototype.hasOwnProperty.call(data, "activityLevel") ||
    Object.prototype.hasOwnProperty.call(data, "activity_level")
  ) {
    payload.activityLevel =
      Object.prototype.hasOwnProperty.call(data, "activityLevel") &&
      data.activityLevel !== undefined
        ? data.activityLevel
        : data.activity_level;
  }

  if (
    Object.prototype.hasOwnProperty.call(data, "exercisePreferences") ||
    Object.prototype.hasOwnProperty.call(data, "exercise_preferences")
  ) {
    payload.exercisePreferences =
      Object.prototype.hasOwnProperty.call(data, "exercisePreferences") &&
      data.exercisePreferences !== undefined
        ? data.exercisePreferences
        : data.exercise_preferences;
  }

  return payload;
};

export const api = {
  getUsers: (): Promise<User[]> => http.request("/api/users"),
  getCurrentUser: (): Promise<User> => http.request("/api/users/me"),
  updateCurrentUser: (data: UserUpdatePayload): Promise<User> =>
    http.request("/api/users/me", {
      method: "PUT",
      json: normalizeUserUpdatePayload(data),
    }),
  getFoodLog: (): Promise<FoodLog[]> => http.request("/api/food-log"),
  getWorkoutLog: (): Promise<WorkoutLog[]> =>
    http.request("/api/workout-log"),
  getAiSuggestions: (): Promise<AiSuggestion[]> =>
    http.request("/api/ai-suggestions"),
  getDailyStatistics: (date: string): Promise<DailyStatistics> =>
    http.request(`/api/statistics/daily?date=${date}`),
  getWeeklyStatistics: (startDate: string, endDate: string): Promise<DailyStatistics[]> =>
    http.request(`/api/statistics/weekly?startDate=${startDate}&endDate=${endDate}`),
};
