// Intent Handler Registry
// Central registry for all intent handlers

import type { IntentHandler } from './base';
import type { IntentCategoryName } from '../intentDetector';
import { GeneralHealthHandler } from './generalHealthHandler';
import { MotivationHandler } from './motivationHandler';
import { ProgressCheckHandler } from './progressCheckHandler';
import { NutritionAdviceHandler } from './nutritionAdviceHandler';
import { WorkoutHandler } from './workoutHandler';

export class HandlerRegistry {
    private handlers: Map<IntentCategoryName, IntentHandler> = new Map();

    constructor() {
        this.registerDefaultHandlers();
    }

    /**
     * Register default handlers
     */
    private registerDefaultHandlers(): void {
        this.register(new GeneralHealthHandler());
        this.register(new MotivationHandler());
        this.register(new ProgressCheckHandler());
        this.register(new NutritionAdviceHandler());
        this.register(new WorkoutHandler());
        // Now covering 5 of 7 intent categories!
        // food_analysis & calorie_query handled by existing logic
    }

    /**
     * Register a handler
     */
    register(handler: IntentHandler): void {
        this.handlers.set(handler.intent, handler);
    }

    /**
     * Get handler for intent
     */
    getHandler(intent: IntentCategoryName): IntentHandler | undefined {
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
    hasHandler(intent: IntentCategoryName): boolean {
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
