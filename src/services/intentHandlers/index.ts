import type { IntentHandler } from './base';
import type { IntentCategoryName } from '../intentDetector';
import { GeneralHealthHandler } from './generalHealthHandler';
import { MotivationHandler } from './motivationHandler';
import { UnknownHandler } from './unknownHandler';
import { ActionHandler } from './actionHandler';
import { MealPlanHandler } from './mealPlanHandler';
import { ExerciseModificationHandler } from './exerciseModificationHandler';

export class HandlerRegistry {
    private handlers: Map<IntentCategoryName | 'action', IntentHandler> = new Map();

    constructor() {
        this.registerDefaultHandlers();
    }

    private registerDefaultHandlers(): void {
        this.register(new ActionHandler());
        this.register(new MealPlanHandler());
        this.register(new ExerciseModificationHandler());
        this.register(new GeneralHealthHandler());
        this.register(new MotivationHandler());
        this.register(new UnknownHandler());

    }


    register(handler: IntentHandler): void {
        const category = handler.category || handler.intent;
        this.handlers.set(category, handler);
    }

    getHandler(intent: IntentCategoryName | 'action'): IntentHandler | undefined {
        return this.handlers.get(intent);
    }


    getAllHandlers(): IntentHandler[] {
        return Array.from(this.handlers.values());
    }


    hasHandler(intent: IntentCategoryName | 'action'): boolean {
        return this.handlers.has(intent);
    }
}

let registryInstance: HandlerRegistry | null = null;


export function getHandlerRegistry(): HandlerRegistry {
    if (!registryInstance) {
        registryInstance = new HandlerRegistry();
    }
    return registryInstance;
}

export function resetHandlerRegistry(): void {
    registryInstance = null;
}
