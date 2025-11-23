import type { IntentCategoryName, DetectedIntent } from '../intentDetector';
import type { ChatContextManager } from '../chatContext';

export interface HandlerResponse {
    content: string;
    metadata?: Record<string, any>;
    nutritionData?: any;
    exercisePlan?: any;
    toolResults?: Array<{
        success: boolean;
        message: string;
        data?: any;
        error?: string;
    }>;
}

export interface HandlerContext {
    contextManager: ChatContextManager;
    userProfile?: any;
    [key: string]: any;
}

export interface IntentHandler {

    readonly intent: IntentCategoryName | 'action';
    readonly category?: IntentCategoryName | 'action';


    canHandle(intent: DetectedIntent, context: HandlerContext): boolean;


    handle(query: string, intent: DetectedIntent, context: HandlerContext): Promise<HandlerResponse>;
}


export abstract class BaseIntentHandler implements IntentHandler {
    abstract readonly intent: IntentCategoryName;

    canHandle(intent: DetectedIntent, _context: HandlerContext): boolean {
        return intent.category === this.intent && intent.confidence > 0.3;
    }

    abstract handle(query: string, intent: DetectedIntent, context: HandlerContext): Promise<HandlerResponse>;


    protected createResponse(content: string, metadata?: Record<string, any>): HandlerResponse {
        return { content, metadata };
    }
}
