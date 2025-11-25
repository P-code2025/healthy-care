import type { FoodEntry } from "./types";

// src/lib/storage.ts
export const STORAGE_KEYS = {
  FOOD_ENTRIES: 'foodDiary_entries_v2',
  DAILY_CALORIES: 'daily_calories',
  DAILY_CALORIE_DATE: 'daily_calorie_date',
} as const;

export const saveFoodEntries = (entries: FoodEntry[]) => {
  localStorage.setItem(STORAGE_KEYS.FOOD_ENTRIES, JSON.stringify(entries));
};

export const loadFoodEntries = (): FoodEntry[] => {
  const data = localStorage.getItem(STORAGE_KEYS.FOOD_ENTRIES);
  return data ? JSON.parse(data) : [];
};

export const saveDailyCalories = (calories: number, date: string) => {
  localStorage.setItem(STORAGE_KEYS.DAILY_CALORIES, calories.toString());
  localStorage.setItem(STORAGE_KEYS.DAILY_CALORIE_DATE, date);
};

export const getDailyCalories = (): { calories: number; date: string } => {
  const calories = localStorage.getItem(STORAGE_KEYS.DAILY_CALORIES);
  const date = localStorage.getItem(STORAGE_KEYS.DAILY_CALORIE_DATE);
  return {
    calories: calories ? parseInt(calories) : 0,
    date: date || '',
  };
};