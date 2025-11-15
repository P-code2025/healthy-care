import type { FoodEntry } from "../lib/types";
import { http } from "./http";

export interface FoodLogDto {
  log_id: number;
  user_id: number;
  eaten_at: string;
  meal_type: FoodEntry["mealType"];
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  sugar?: number | null;
  amount?: string | null;
  status?: FoodEntry["status"] | null;
  thoughts?: string | null;
}

export interface FoodLogPayload {
  eatenAt?: string;
  mealType: FoodEntry["mealType"];
  foodName: string;
  amount?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar?: number;
  status?: FoodEntry["status"];
  thoughts?: string;
}

export type FoodEntryInput = Omit<FoodEntry, "id">;

const toIsoDateTime = (entry: FoodEntryInput) => {
  if (entry.date && entry.time) {
    return new Date(`${entry.date}T${entry.time}`).toISOString();
  }
  return new Date().toISOString();
};

const formatTimeDisplay = (isoDate: string) =>
  new Date(isoDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export const mapFoodLogToEntry = (log: FoodLogDto): FoodEntry => ({
  id: log.log_id.toString(),
  date: log.eaten_at.split("T")[0],
  time: formatTimeDisplay(log.eaten_at),
  mealType: log.meal_type as FoodEntry["mealType"],
  foodName: log.food_name,
  amount: log.amount || "",
  calories: log.calories,
  protein: Math.round(log.protein_g),
  carbs: Math.round(log.carbs_g),
  fat: Math.round(log.fat_g),
  sugar: Math.round(log.sugar || 0),
  status: (log.status as FoodEntry["status"]) || "Satisfied",
  thoughts: log.thoughts || "",
});

export const foodDiaryApi = {
  async list(params?: { start?: string; end?: string }) {
    const query = new URLSearchParams();
    if (params?.start) query.set("start", params.start);
    if (params?.end) query.set("end", params.end);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return http.request<FoodLogDto[]>(`/api/food-log${suffix}`);
  },
  async create(entry: FoodEntryInput) {
    const payload: FoodLogPayload = {
      eatenAt: toIsoDateTime(entry),
      mealType: entry.mealType,
      foodName: entry.foodName,
      amount: entry.amount,
      calories: entry.calories,
      protein: entry.protein,
      carbs: entry.carbs,
      fat: entry.fat,
      sugar: entry.sugar,
      status: entry.status,
      thoughts: entry.thoughts,
    };
    return http.request<FoodLogDto>("/api/food-log", {
      method: "POST",
      json: payload,
    });
  },
  async remove(id: string) {
    return http.request<void>(`/api/food-log/${id}`, { method: "DELETE" });
  },
  async batchDelete(ids: string[]) {
    return http.request("/api/food-log/batch-delete", {
      method: "POST",
      json: { ids },
    });
  },
};
