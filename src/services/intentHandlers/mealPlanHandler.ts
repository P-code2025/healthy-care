// Meal Plan Intent Handler - Handles meal planning conversations
import type { IntentHandler, HandlerContext, HandlerResponse } from './base';
import type { DetectedIntent } from '../intentDetector';
import { getToolRegistry } from '../tools/registry';
import type { ToolContext } from '../tools/base';

/**
 * Meal Plan Handler
 * Handles meal plan generation and modification requests
 */
export class MealPlanHandler implements IntentHandler {
    readonly intent = 'meal_plan_request' as const;
    category = 'meal_plan_request' as const;

    canHandle(intent: DetectedIntent, _context: HandlerContext): boolean {
        return intent.category === 'meal_plan_request' ||
            intent.category === 'meal_plan_modification';
    }

    async handle(
        query: string,
        intent: DetectedIntent,
        context?: HandlerContext
    ): Promise<HandlerResponse> {
        try {
            const registry = getToolRegistry();

            if (intent.category === 'meal_plan_request') {
                // Generate new meal plan
                return await this.handleMealPlanGeneration(query, context, registry);
            } else if (intent.category === 'meal_plan_modification') {
                // Modify existing meal
                return await this.handleMealModification(query, context, registry);
            }

            return {
                content: '🍽️ I can help you with meal planning! Just ask me to generate a meal plan or modify a specific meal.',
            };
        } catch (error: any) {
            console.error('Meal plan handler error:', error);
            return {
                content: `❌ **Error**\n\nSorry, I encountered an error while handling your meal plan request: ${error.message}`,
            };
        }
    }

    private async handleMealPlanGeneration(
        query: string,
        context: HandlerContext | undefined,
        registry: any
    ): Promise<HandlerResponse> {
        // Extract preferences from query
        const preferences = this.extractPreferences(query);
        const allergies = this.extractAllergies(query);

        const tool = registry.get('generate_weekly_meal_plan');
        if (!tool) {
            return {
                content: '⚠️ Meal plan generation tool is not available.',
            };
        }

        const toolContext: ToolContext = {
            userId: context?.userProfile?.userId,
            userProfile: context?.userProfile,
        };

        const result = await registry.executeToolByName(
            'generate_weekly_meal_plan',
            { preferences, allergies: allergies.join(',') },
            toolContext
        );

        if (!result.success) {
            return {
                content: `❌ **Failed to Generate Meal Plan**\n\n${result.message}`,
            };
        }

        return {
            content: result.message,
            toolResults: [result],
        };
    }

    private async handleMealModification(
        query: string,
        context: HandlerContext | undefined,
        registry: any
    ): Promise<HandlerResponse> {
        // Extract modification parameters
        const params = this.extractModificationParams(query);

        if (!params.day || !params.mealType) {
            return {
                content: '🤔 Please specify which meal you want to change.\n\nFor example:\n- "Đổi món bữa tối thứ 2"\n- "Change Tuesday lunch"\n- "I don\'t like Monday dinner"',
            };
        }

        const tool = registry.get('modify_meal_plan_item');
        if (!tool) {
            return {
                content: '⚠️ Meal modification tool is not available.',
            };
        }

        const toolContext: ToolContext = {
            userId: context?.userProfile?.userId,
            userProfile: context?.userProfile,
        };

        const result = await registry.executeToolByName(
            'modify_meal_plan_item',
            params,
            toolContext
        );

        if (!result.success) {
            return {
                content: `❌ **Failed to Modify Meal**\n\n${result.message}`,
            };
        }

        return {
            content: result.message,
            toolResults: [result],
        };
    }

    private extractPreferences(query: string): string {
        const normalized = query.toLowerCase();

        const preferences: string[] = [];

        if (normalized.match(/vegetarian|chay/)) preferences.push('vegetarian');
        if (normalized.match(/vegan/)) preferences.push('vegan');
        if (normalized.match(/keto/)) preferences.push('keto');
        if (normalized.match(/low carb|it carb/)) preferences.push('low carb');
        if (normalized.match(/high protein|nhieu protein/)) preferences.push('high protein');
        if (normalized.match(/balanced|can bang|cân bằng/)) preferences.push('balanced diet');

        return preferences.join(', ') || 'balanced diet';
    }

    private extractAllergies(query: string): string[] {
        const normalized = query.toLowerCase();
        const allergies: string[] = [];

        if (normalized.match(/dairy|sua|sữa/)) allergies.push('dairy');
        if (normalized.match(/gluten/)) allergies.push('gluten');
        if (normalized.match(/nuts|hat|hạt/)) allergies.push('nuts');
        if (normalized.match(/shellfish|tom|tôm|cua|cá/)) allergies.push('shellfish');
        if (normalized.match(/soy|dau nanh|đậu nành/)) allergies.push('soy');

        return allergies;
    }

    private extractModificationParams(query: string): {
        day?: string;
        mealType?: string;
        exclude?: string;
        preferences?: string;
    } {
        const normalized = query.toLowerCase();
        const params: any = {};

        // Extract day of week
        const dayPatterns = {
            monday: /mon|thu 2|thứ 2|t2/,
            tuesday: /tue|thu 3|thứ 3|t3/,
            wednesday: /wed|thu 4|thứ 4|t4/,
            thursday: /thu|thu 5|thứ 5|t5/,
            friday: /fri|thu 6|thứ 6|t6/,
            saturday: /sat|thu 7|thứ 7|t7/,
            sunday: /sun|chu nhat|chủ nhật|cn/,
        };

        for (const [day, pattern] of Object.entries(dayPatterns)) {
            if (pattern.test(normalized)) {
                params.day = day;
                break;
            }
        }

        // Extract meal type
        if (normalized.match(/breakfast|bua sang|bữa sáng|sang|sáng/)) {
            params.mealType = 'breakfast';
        } else if (normalized.match(/lunch|bua trua|bữa trưa|trua|trưa/)) {
            params.mealType = 'lunch';
        } else if (normalized.match(/dinner|bua toi|bữa tối|toi|tối/)) {
            params.mealType = 'dinner';
        } else if (normalized.match(/snack|an vat|ăn vặt/)) {
            params.mealType = 'snack';
        }

        // Extract excluded foods (items user doesn't like)
        const excludeMatch = normalized.match(/khong thich|không thích|don't like|hate|dislike\s+([^,\.]+)/);
        if (excludeMatch) {
            params.exclude = excludeMatch[1].trim();
        }

        // Extract preferences for replacement
        params.preferences = this.extractPreferences(query);

        return params;
    }
}
