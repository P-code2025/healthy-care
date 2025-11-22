// Food Diary Tools - Automated food logging
import { BaseTool, type ToolParameter, type ToolContext, type ToolResult } from './base';
import { foodDiaryApi, type FoodEntryInput } from '../foodDiaryApi';

/**
 * Tool: Add Food Diary Entry
 * Automatically adds food to the user's food diary
 */
export class AddFoodDiaryEntryTool extends BaseTool {
    name = 'add_food_diary_entry';
    description = 'Add a food item to the food diary';
    category = 'food' as const;

    parameters: ToolParameter[] = [
        {
            name: 'foodName',
            type: 'string',
            description: 'Name of the food (e.g., "Cơm gà", "Bánh mì")',
            required: true,
        },
        {
            name: 'calories',
            type: 'number',
            description: 'Calories in kcal',
            required: true,
        },
        {
            name: 'protein',
            type: 'number',
            description: 'Protein in grams (optional)',
            required: false,
        },
        {
            name: 'carbs',
            type: 'number',
            description: 'Carbs in grams (optional)',
            required: false,
        },
        {
            name: 'fat',
            type: 'number',
            description: 'Fat in grams (optional)',
            required: false,
        },
        {
            name: 'sugar',
            type: 'number',
            description: 'Sugar in grams (optional)',
            required: false,
        },
        {
            name: 'mealType',
            type: 'string',
            description: 'Meal type (auto-detected if not provided)',
            required: false,
            enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
        },
        {
            name: 'amount',
            type: 'string',
            description: 'Portion size (e.g., "100g", "1 serving")',
            required: false,
        },
    ];

    async execute(args: Record<string, any>, _context: ToolContext): Promise<ToolResult> {
        try {
            this.validateParameters(args);

            // Auto-detect meal type based on current time if not provided
            const mealType = args.mealType || this.detectMealType();

            const now = new Date();
            const entry: FoodEntryInput = {
                date: now.toISOString().split('T')[0],
                time: now.toISOString().slice(11, 16),
                mealType,
                foodName: args.foodName,
                amount: args.amount || '1 serving',
                calories: Math.round(args.calories),
                protein: Math.round(args.protein || 0),
                carbs: Math.round(args.carbs || 0),
                fat: Math.round(args.fat || 0),
                sugar: Math.round(args.sugar || 0),
                status: 'Satisfied',
                thoughts: 'Added via AI Chat',
            };

            const createdEntry = await foodDiaryApi.create(entry);

            const macroText = [
                args.protein ? `P: ${args.protein}g` : null,
                args.carbs ? `C: ${args.carbs}g` : null,
                args.fat ? `F: ${args.fat}g` : null,
            ].filter(Boolean).join(' | ');

            return this.success(
                `🍽️ **Food Added to Diary!**\n\n` +
                `📌 **${args.foodName}**\n` +
                `${args.amount ? `📏 ${args.amount}\n` : ''}` +
                `🔥 ${args.calories} kcal\n` +
                `${macroText ? `📊 ${macroText}\n` : ''}` +
                `🕐 ${mealType} - ${entry.time}\n\n` +
                `✅ Successfully logged!`,
                createdEntry
            );
        } catch (error: any) {
            return this.error(
                `Failed to add food diary entry: ${error.message}`,
                error
            );
        }
    }

    private detectMealType(): FoodEntryInput['mealType'] {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 11) return 'Breakfast';
        if (hour >= 11 && hour < 15) return 'Lunch';
        if (hour >= 18 && hour < 22) return 'Dinner';
        return 'Snack';
    }
}

/**
 * Tool: Get Today's Nutrition
 * Retrieves total nutrition for today
 */
export class GetTodayNutritionTool extends BaseTool {
    name = 'get_today_nutrition';
    description = 'Get total calories and macros consumed today';
    category = 'food' as const;

    parameters: ToolParameter[] = [];

    async execute(_args: Record<string, any>, _context: ToolContext): Promise<ToolResult> {
        try {
            const today = new Date().toISOString().split('T')[0];

            const entries = await foodDiaryApi.list({ start: today, end: today });

            if (entries.length === 0) {
                return this.success(
                    `📊 **Today's Nutrition**\n\n` +
                    `No food logged yet today.\n\n` +
                    `💡 Start tracking your meals to see your daily totals!`
                );
            }

            // Map FoodLogDto properties correctly
            const totals = entries.reduce((acc, entry) => ({
                calories: acc.calories + entry.calories,
                protein: acc.protein + (entry.protein_g || 0),
                carbs: acc.carbs + (entry.carbs_g || 0),
                fat: acc.fat + (entry.fat_g || 0),
                sugar: acc.sugar + (entry.sugar || 0),
            }), { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 });

            return this.success(
                `📊 **Today's Nutrition Summary**\n\n` +
                `🔥 **${totals.calories} kcal** total\n` +
                `🥩 Protein: ${totals.protein}g\n` +
                `🍚 Carbs: ${totals.carbs}g\n` +
                `🥑 Fat: ${totals.fat}g\n` +
                `🍬 Sugar: ${totals.sugar}g\n\n` +
                `📝 Meals logged: ${entries.length}`,
                totals
            );
        } catch (error: any) {
            return this.error(
                `Failed to get today's nutrition: ${error.message}`,
                error
            );
        }
    }
}
