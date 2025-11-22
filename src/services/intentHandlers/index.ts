// Intent Handler Registry
// Central registry for all intent handlers

import type { IntentHandler } from './base';
import type { IntentCategoryName } from '../intentDetector';
import { GeneralHealthHandler } from './generalHealthHandler';
import { MotivationHandler } from './motivationHandler';
import { ProgressCheckHandler } from './progressCheckHandler';
import { NutritionAdviceHandler } from './nutritionAdviceHandler';
import { WorkoutHandler } from './workoutHandler';
import { UnknownHandler } from './unknownHandler';
import { ActionHandler } from './actionHandler';
import { MealPlanHandler } from './mealPlanHandler';
import { ExerciseModificationHandler } from './exerciseModificationHandler';

export class HandlerRegistry {
    private handlers: Map<IntentCategoryName | 'action', IntentHandler> = new Map();

    constructor() {
        this.registerDefaultHandlers();
    }

    /**
     * Register default handlers
     */
    private registerDefaultHandlers(): void {
        // Register action handler first for tool calling
        this.register(new ActionHandler());

        // Register specialized handlers
        this.register(new MealPlanHandler());
        this.register(new ExerciseModificationHandler());

        // Register other handlers
        this.register(new GeneralHealthHandler());
        this.register(new MotivationHandler());
        this.register(new ProgressCheckHandler());
        this.register(new NutritionAdviceHandler());
        this.register(new WorkoutHandler());
        this.register(new UnknownHandler());

        // Now covering all intent categories + action handler!
        // food_analysis & calorie_query handled by existing logic in Messages.tsx
    }

    /**
     * Register a handler
     */
    register(handler: IntentHandler): void {
        const category = handler.category || handler.intent;
        this.handlers.set(category, handler);
    }

    /**
     * Get handler for intent
     */
    getHandler(intent: IntentCategoryName | 'action'): IntentHandler | undefined {
        return this.handlers.get(intent);
    }

    /**
     * Get all registered handlers
     */
    getAllHandlers(): IntentHandler[] {
        return Array.from(this.handlers.values());
    }

    /**
     * Check if handler exists for intent
     */
    hasHandler(intent: IntentCategoryName | 'action'): boolean {
        return this.handlers.has(intent);
    }
}

// Singleton instance
let registryInstance: HandlerRegistry | null = null;

/**
 * Get or create the global handler registry
 */
export function getHandlerRegistry(): HandlerRegistry {
    if (!registryInstance) {
        registryInstance = new HandlerRegistry();
    }
    return registryInstance;
}

/**
 * Reset the global handler registry (for testing)
 */
export function resetHandlerRegistry(): void {
    registryInstance = null;
}
