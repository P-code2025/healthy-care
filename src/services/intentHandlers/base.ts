// Base Intent Handler Interface

import type { IntentCategoryName, DetectedIntent } from '../intentDetector';
import type { ChatContextManager } from '../chatContext';

export interface HandlerResponse {
    content: string;
    metadata?: Record<string, any>;
    // Add future fields (images, charts, etc.)
    nutritionData?: any;
    exercisePlan?: any;
}

export interface HandlerContext {
    contextManager: ChatContextManager;
    userProfile?: any;
    [key: string]: any;
}

/**
 * Base interface for intent handlers
 * Each intent category should implement this interface
 */
export interface IntentHandler {
    /**
     * Intent category this handler supports
     */
    readonly intent: IntentCategoryName;

    /**
     * Check if this handler can handle the given intent
     */
    canHandle(intent: DetectedIntent, context: HandlerContext): boolean;

    /**
     * Handle the intent and generate response
     */
    handle(query: string, intent: DetectedIntent, context: HandlerContext): Promise<HandlerResponse>;
}

/**
 * Abstract base class for intent handlers
 */
export abstract class BaseIntentHandler implements IntentHandler {
    abstract readonly intent: IntentCategoryName;

    canHandle(intent: DetectedIntent, context: HandlerContext): boolean {
        return intent.category === this.intent && intent.confidence > 0.3;
    }

    abstract handle(query: string, intent: DetectedIntent, context: HandlerContext): Promise<HandlerResponse>;

    /**
     * Helper to create simple text response
     */
    protected createResponse(content: string, metadata?: Record<string, any>): HandlerResponse {
        return { content, metadata };
    }
}
