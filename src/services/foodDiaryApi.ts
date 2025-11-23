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
  image_url?: string | null;
  image_attribution?: string | null;
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
  imageUrl?: string;
  imageAttribution?: string;
}

export type FoodEntryInput = Omit<FoodEntry, "id">;

const toIsoDateTime = (entry: FoodEntryInput) => {
  if (entry.date && entry.time) {
    const [year, month, day] = entry.date.split('-').map(Number);
    const [hour, minute] = entry.time.split(':').map(Number);
    const localDate = new Date(year, month - 1, day, hour, minute);
    return localDate.toISOString();
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
  protein: parseFloat(log.protein_g.toFixed(1)),
  carbs: parseFloat(log.carbs_g.toFixed(1)),
  fat: parseFloat(log.fat_g.toFixed(1)),
  sugar: parseFloat((log.sugar || 0).toFixed(1)),
  status: (log.status as FoodEntry["status"]) || "Satisfied",
  thoughts: log.thoughts || "",
  imageUrl: log.image_url || undefined,
  imageAttribution: log.image_attribution || undefined,
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
      imageUrl: entry.imageUrl,
      imageAttribution: entry.imageAttribution,
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
