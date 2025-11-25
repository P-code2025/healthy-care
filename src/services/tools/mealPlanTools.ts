// Meal Plan Tools - AI-powered meal plan generation and modification
import { BaseTool, type ToolParameter, type ToolContext, type ToolResult } from './base';
import { generateAIMealPlan, type AIMealPlanResponse, type DayPlan } from '../aiMealPlan';

/**
 * Tool: Generate Weekly Meal Plan
 * Generates a 7-day meal plan using CLOVA AI based on user profile
 */
export class GenerateWeeklyMealPlanTool extends BaseTool {
    name = 'generate_weekly_meal_plan';
    description = 'Generate a complete 7-day meal plan based on user preferences and nutritional goals';
    category = 'meal_plan' as const;

    parameters: ToolParameter[] = [
        {
            name: 'allergies',
            type: 'string',
            description: 'Food allergies (comma-separated)',
            required: false,
        },
        {
            name: 'preferences',
            type: 'string',
            description: 'Dietary preferences or restrictions',
            required: false,
        },
    ];

    async execute(args: Record<string, any>, _context: ToolContext): Promise<ToolResult> {
        try {
            this.validateParameters(args);

            const allergies = args.allergies
                ? args.allergies.split(',').map((a: string) => a.trim()).filter(Boolean)
                : [];
            const preferences = args.preferences || 'balanced diet';

            const mealPlan = await generateAIMealPlan(allergies, preferences);

            // Format response with meal details
            const planSummary = this.formatMealPlanSummary(mealPlan);

            return this.success(
                `🍽️ **Weekly Meal Plan Generated!**\n\n` +
                `📊 Target: ${mealPlan.weeklyCalories} kcal/day\n\n` +
                planSummary +
                `\n✅ Meal plan is ready! You can ask me to modify any specific meal.`,
                { mealPlan }
            );
        } catch (error: any) {
            return this.error(
                `Failed to generate meal plan: ${error.message}`,
                error
            );
        }
    }

    private formatMealPlanSummary(plan: AIMealPlanResponse): string {
        return plan.days.slice(0, 3).map(day => {
            const meals: string[] = [];
            if (day.breakfast) meals.push(`🍳 Breakfast: ${day.breakfast.name} (${day.breakfast.calories} kcal)`);
            if (day.lunch) meals.push(`🍱 Lunch: ${day.lunch.name} (${day.lunch.calories} kcal)`);
            if (day.snack) meals.push(`🥗 Snack: ${day.snack.name} (${day.snack.calories} kcal)`);
            if (day.dinner) meals.push(`🍲 Dinner: ${day.dinner.name} (${day.dinner.calories} kcal)`);

            return `**${day.day}** (${day.date})\n${meals.join('\n')}`;
        }).join('\n\n') + '\n\n_... and 4 more days_';
    }
}

/**
 * Tool: Modify Meal Plan Item
 * Replace a specific meal in the weekly plan with a new suggestion
 */
export class ModifyMealPlanItemTool extends BaseTool {
    name = 'modify_meal_plan_item';
    description = 'Replace a specific meal in the meal plan with a new suggestion';
    category = 'meal_plan' as const;

    parameters: ToolParameter[] = [
        {
            name: 'day',
            type: 'string',
            description: 'Day of week (Monday, Tuesday, etc.)',
            required: true,
        },
        {
            name: 'mealType',
            type: 'string',
            description: 'Meal type',
            required: true,
            enum: ['breakfast', 'lunch', 'snack', 'dinner'],
        },
        {
            name: 'exclude',
            type: 'string',
            description: 'Foods to exclude (comma-separated)',
            required: false,
        },
        {
            name: 'preferences',
            type: 'string',
            description: 'Specific preferences for replacement',
            required: false,
        },
    ];

    async execute(args: Record<string, any>, context: ToolContext): Promise<ToolResult> {
        try {
            this.validateParameters(args);

            if (!context.userId) {
                return this.error('User ID is required to modify meal plan');
            }

            const excludeList = args.exclude
                ? args.exclude.split(',').map((e: string) => e.trim()).filter(Boolean)
                : [];

            // Call backend to get a replacement meal
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/meal-plan/modify`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({
                        day: args.day,
                        mealType: args.mealType,
                        exclude: excludeList,
                        preferences: args.preferences || '',
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to modify meal plan');
            }

            const { meal } = await response.json();

            return this.success(
                `✅ **Meal Updated!**\n\n` +
                `📅 **${args.day}** - ${this.getMealEmoji(args.mealType)} **${this.formatMealType(args.mealType)}**\n\n` +
                `🍽️ **${meal.name}**\n` +
                `📊 ${meal.calories} kcal | Protein: ${meal.protein}g\n` +
                `${meal.carbs ? `Carbs: ${meal.carbs}g | ` : ''}${meal.fat ? `Fat: ${meal.fat}g` : ''}\n\n` +
                `The rest of your meal plan remains unchanged! 👍`,
                { meal, day: args.day, mealType: args.mealType }
            );
        } catch (error: any) {
            return this.error(
                `Failed to modify meal: ${error.message}`,
                error
            );
        }
    }

    private getMealEmoji(mealType: string): string {
        const emojis: Record<string, string> = {
            breakfast: '🍳',
            lunch: '🍱',
            snack: '🥗',
            dinner: '🍲',
        };
        return emojis[mealType.toLowerCase()] || '🍽️';
    }

    private formatMealType(mealType: string): string {
        return mealType.charAt(0).toUpperCase() + mealType.slice(1);
    }
}

/**
 * Tool: Get Current Meal Plan
 * Retrieve the active meal plan from context
 */
export class GetCurrentMealPlanTool extends BaseTool {
    name = 'get_current_meal_plan';
    description = 'Retrieve the currently active meal plan';
    category = 'meal_plan' as const;

    parameters: ToolParameter[] = [
        {
            name: 'day',
            type: 'string',
            description: 'Specific day to query (optional)',
            required: false,
        },
    ];

    async execute(args: Record<string, any>, context: ToolContext): Promise<ToolResult> {
        try {
            // Get meal plan from context (extended with metadata)
            const mealPlan = (context as any).metadata?.currentMealPlan as AIMealPlanResponse | undefined;

            if (!mealPlan) {
                return this.success(
                    `📅 No active meal plan found.\n\n` +
                    `Would you like me to generate a new meal plan for you?`
                );
            }

            if (args.day) {
                // Return specific day
                const dayPlan = mealPlan.days.find(
                    d => d.day.toLowerCase() === args.day.toLowerCase()
                );

                if (!dayPlan) {
                    return this.error(`Day "${args.day}" not found in meal plan`);
                }

                return this.success(
                    `📅 **${dayPlan.day}** (${dayPlan.date})\n\n` +
                    this.formatDayMeals(dayPlan),
                    { dayPlan }
                );
            }

            // Return full plan summary
            const summary = mealPlan.days.map(day =>
                `**${day.day}** (${day.date}): ${this.getTotalCalories(day)} kcal`
            ).join('\n');

            return this.success(
                `📅 **Your Current Meal Plan**\n\n` +
                `🎯 Target: ${mealPlan.weeklyCalories} kcal/day\n\n` +
                summary +
                `\n\nAsk me about a specific day or meal to see more details!`,
                { mealPlan }
            );
        } catch (error: any) {
            return this.error(
                `Failed to retrieve meal plan: ${error.message}`,
                error
            );
        }
    }

    private formatDayMeals(day: DayPlan): string {
        const meals: string[] = [];
        if (day.breakfast) meals.push(`🍳 **Breakfast**: ${day.breakfast.name} (${day.breakfast.calories} kcal)`);
        if (day.lunch) meals.push(`🍱 **Lunch**: ${day.lunch.name} (${day.lunch.calories} kcal)`);
        if (day.snack) meals.push(`🥗 **Snack**: ${day.snack.name} (${day.snack.calories} kcal)`);
        if (day.dinner) meals.push(`🍲 **Dinner**: ${day.dinner.name} (${day.dinner.calories} kcal)`);
        return meals.join('\n');
    }

    private getTotalCalories(day: DayPlan): number {
        return (
            (day.breakfast?.calories || 0) +
            (day.lunch?.calories || 0) +
            (day.snack?.calories || 0) +
            (day.dinner?.calories || 0)
        );
    }
}
