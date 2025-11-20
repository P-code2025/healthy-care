// AI Meal Plan Generator - Simplified version
// Analyzes food diary to create personalized meal plan suggestions

import type { FoodEntry } from '../lib/types';

// ==================== TYPES ====================

export interface FoodAnalysis {
    favoriteFoods: string[];
    avgCaloriesPerMeal: number;
    macroRatio: { protein: number; carbs: number; fat: number };
}

export interface MealItem {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export interface DayMealPlan {
    breakfast: MealItem;
    lunch: MealItem;
    dinner: MealItem;
    snack: MealItem;
}

export interface AIGeneratedMealPlan {
    generatedAt: string;
    basedOnDays: number;
    analyzedEntries: number;
    plan: Record<string, DayMealPlan>; // Monday, Tuesday, etc.
    summary: string;
}

// ==================== ANALYZE HISTORY ====================

export function analyzeFoodHistory(entries: FoodEntry[]): FoodAnalysis {
    if (entries.length === 0) {
        return {
            favoriteFoods: [],
            avgCaloriesPerMeal: 0,
            macroRatio: { protein: 25, carbs: 45, fat: 30 }
        };
    }

    // Count food frequency
    const foodFreq: Record<string, number> = {};
    entries.forEach(e => {
        foodFreq[e.foodName] = (foodFreq[e.foodName] || 0) + 1;
    });

    // Top 10 favorites
    const favoriteFoods = Object.entries(foodFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([food]) => food);

    // Average calories
    const totalCal = entries.reduce((sum, e) => sum + e.calories, 0);
    const avgCaloriesPerMeal = Math.round(totalCal / entries.length);

    // Macro ratios
    const totalP = entries.reduce((sum, e) => sum + e.protein, 0);
    const totalC = entries.reduce((sum, e) => sum + e.carbs, 0);
    const totalF = entries.reduce((sum, e) => sum + e.fat, 0);
    const totalMacro = totalP + totalC + totalF;

    const macroRatio = totalMacro > 0 ? {
        protein: Math.round((totalP / totalMacro) * 100),
        carbs: Math.round((totalC / totalMacro) * 100),
        fat: Math.round((totalF / totalMacro) * 100)
    } : { protein: 25, carbs: 45, fat: 30 };

    return { favoriteFoods, avgCaloriesPerMeal, macroRatio };
}

// ==================== GENERATE MEAL PLAN ====================

export async function generateMealPlanFromHistory(
    foodHistory: FoodEntry[],
    userGoal: 'lose' | 'maintain' | 'gain' = 'maintain'
): Promise<AIGeneratedMealPlan> {

    const analysis = analyzeFoodHistory(foodHistory);

    // Adjust calorie target based on goal
    let targetCal = analysis.avgCaloriesPerMeal;
    if (userGoal === 'lose') targetCal = Math.round(targetCal * 0.85);
    if (userGoal === 'gain') targetCal = Math.round(targetCal * 1.15);

    // Generate simple plan using favorites
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const plan: Record<string, DayMealPlan> = {};

    // Calorie-to-gram conversion constants
    const CALORIES_PER_GRAM = { protein: 4, carbs: 4, fat: 9 };

    days.forEach((day, index) => {
        // Rotate through favorites to create variety
        const favIndex = index % Math.max(analysis.favoriteFoods.length, 1);
        const baseFoodName = analysis.favoriteFoods[favIndex] || 'Healthy meal';

        // Calculate calories for each meal type
        const breakfastCal = Math.round(targetCal * 0.3);
        const lunchCal = Math.round(targetCal * 0.35);
        const dinnerCal = Math.round(targetCal * 0.3);
        const snackCal = Math.round(targetCal * 0.05);

        // Helper function to calculate macros from calories
        const calculateMacros = (mealCalories: number) => {
            const proteinPercent = analysis.macroRatio.protein / 100;
            const carbsPercent = analysis.macroRatio.carbs / 100;
            const fatPercent = analysis.macroRatio.fat / 100;

            return {
                protein: Math.round((mealCalories * proteinPercent) / CALORIES_PER_GRAM.protein),
                carbs: Math.round((mealCalories * carbsPercent) / CALORIES_PER_GRAM.carbs),
                fat: Math.round((mealCalories * fatPercent) / CALORIES_PER_GRAM.fat)
            };
        };

        const breakfastMacros = calculateMacros(breakfastCal);
        const lunchMacros = calculateMacros(lunchCal);
        const dinnerMacros = calculateMacros(dinnerCal);
        const snackMacros = calculateMacros(snackCal);

        plan[day] = {
            breakfast: {
                name: `${baseFoodName} - Breakfast style`,
                calories: breakfastCal,
                ...breakfastMacros
            },
            lunch: {
                name: `${analysis.favoriteFoods[(favIndex + 1) % Math.max(analysis.favoriteFoods.length, 1)] || 'Balanced meal'}`,
                calories: lunchCal,
                ...lunchMacros
            },
            dinner: {
                name: `${analysis.favoriteFoods[(favIndex + 2) % Math.max(analysis.favoriteFoods.length, 1)] || 'Nutritious dinner'}`,
                calories: dinnerCal,
                ...dinnerMacros
            },
            snack: {
                name: 'Healthy snack',
                calories: snackCal,
                ...snackMacros
            }
        };
    });

    return {
        generatedAt: new Date().toISOString(),
        basedOnDays: 30,
        analyzedEntries: foodHistory.length,
        plan,
        summary: `Personalized ${userGoal === 'lose' ? 'weight loss' : userGoal === 'gain' ? 'muscle gain' : 'maintenance'} plan based on your eating habits`
    };
}

// ==================== LOCALSTORAGE ====================

export function saveAIMealPlan(plan: AIGeneratedMealPlan): void {
    try {
        localStorage.setItem('ai_meal_plan', JSON.stringify(plan));
    } catch (error) {
        console.error('Failed to save AI meal plan:', error);
    }
}

export function loadAIMealPlan(): AIGeneratedMealPlan | null {
    try {
        const stored = localStorage.getItem('ai_meal_plan');
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        console.error('Failed to load AI meal plan:', error);
        return null;
    }
}

export function clearAIMealPlan(): void {
    localStorage.removeItem('ai_meal_plan');
}
