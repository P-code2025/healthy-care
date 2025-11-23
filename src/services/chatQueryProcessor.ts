// Chat Query Processor - Routes queries through intent detection and handlers
import { IntentDetector } from "./intentDetector";
import { getHandlerRegistry } from "./intentHandlers";
import { ChatContextManager } from "./chatContext";
import { processChatWithToolCalling } from "./clovaToolCalling";
import type { AnalysisResult } from "../lib/types";
import type { AIExercisePlan } from "./aiExercisePlan";

export interface ChatQueryContext {
    user?: {
        user_id: number;
        age?: number | null;
        weight_kg?: number | null;
        height_cm?: number | null;
        gender?: string | null;
        goal?: string | null;
    };
    userProfile: {
        age: number;
        weight: number;
        height: number;
        gender: "Male" | "Female";
        goal: "lose" | "maintain" | "gain";
        workoutDays: number;
        userId?: number;
    };
    chatMessages: Array<{
        id: string;
        content: string;
        isUser: boolean;
        timestamp: string;
    }>;
    diaryEntries: Array<{
        foodName: string;
        amount: string;
        calories: number;
    }>;
    chatMode?: 'chat' | 'action'; // NEW: chat mode toggle
}

export interface ChatQueryResult {
    content: string;
    intent?: string;
    nutritionData?: AnalysisResult;
    exercisePlan?: AIExercisePlan;
}

/**
 * Process a chat query using mode-specific logic
 */
export async function processChatQuery(
    query: string,
    context: ChatQueryContext
): Promise<ChatQueryResult> {
    const { chatMode = 'chat' } = context;

    console.log(`🎯 Processing query in ${chatMode.toUpperCase()} mode:`, query);

    // CHAT MODE: Skip tool calling, use intent-based handlers only
    if (chatMode === 'chat') {
        console.log('💬 Chat mode: Using intent detection (no tools)');
        return await processWithIntentDetection(query, context);
    }

    // ACTION MODE: Try tool calling first
    console.log('⚡ Action mode: Attempting tool calling');

    const toolContext = {
        userId: context.user?.user_id || context.userProfile?.userId,
        userProfile: context.userProfile,
    };

    const chatHistory = context.chatMessages.slice(-5).map(msg => ({
        role: (msg.isUser ? 'user' : 'assistant') as 'user' | 'assistant',
        content: msg.content
    }));

    try {
        const clovaResult = await processChatWithToolCalling(
            query,
            toolContext,
            chatHistory
        );

        if (clovaResult.usedTool) {
            console.log('✅ Tool called successfully');
            return {
                content: clovaResult.content,
                intent: 'clova_tool_call',
            };
        }

        // CLOVA didn't use a tool, check if it gave a good response
        if (clovaResult.content && clovaResult.content.length > 20) {
            console.log('✅ CLOVA provided a text response');
            return {
                content: clovaResult.content,
                intent: 'clova_response',
            };
        }

        console.log('ℹ️ No tool called, falling back to intent detection');

    } catch (error) {
        console.error('Tool calling failed:', error);
    }

    // Fallback to intent detection
    return await processWithIntentDetection(query, context);
}

/**
 * Process query using intent detection and handlers
 */
async function processWithIntentDetection(
    query: string,
    context: ChatQueryContext
): Promise<ChatQueryResult> {
    const detector = new IntentDetector();
    const contextManager = new ChatContextManager(10);

    // Detect intent
    const chatContext = {
        hasImage: false,
        lastIntent: undefined,
        recentTopics: [],
        messageCount: context.chatMessages.length,
    };

    const intent = detector.detect(query, chatContext);
    console.log(`🔍 Intent Detection:`, {
        query,
        category: intent.category,
        confidence: intent.confidence,
    });

    // Get appropriate handler
    const handlerRegistry = getHandlerRegistry();
    const handler = handlerRegistry.getHandler(intent.category);

    if (!handler) {
        console.warn(`⚠️ No handler found for intent: ${intent.category}`);
        return {
            content: "I'm not sure how to help with that. Could you rephrase your question?",
            intent: intent.category,
        };
    }

    console.log(`✅ Using handler: ${handler.constructor.name}`);

    // Execute handler - include userId for tool execution
    const handlerContext = {
        userId: context.user?.user_id,
        userProfile: context.userProfile,
        recentMeals: context.diaryEntries,
        contextManager,
    };

    const response = await handler.handle(query, intent, handlerContext);

    console.log(`📤 Handler response:`, {
        contentLength: response.content?.length || 0,
        hasExercisePlan: !!response.exercisePlan,
        hasNutritionData: !!response.nutritionData,
    });

    return {
        content: response.content || "I apologize, but I couldn't generate a response.",
        intent: intent.category,
        nutritionData: response.nutritionData,
        exercisePlan: response.exercisePlan,
    };
}
