// Contextual Typing Messages for AI Chat
import type { IntentCategoryName } from '../services/intentDetector';

/**
 * Get contextual loading message based on detected intent
 */
export function getTypingMessage(intent?: IntentCategoryName): string {
    const messages: Record<IntentCategoryName, string> = {
        food_analysis: '🔍 Analyzing your meal...',
        workout_plan: '💪 Crafting your workout plan...',
        calorie_query: '🧮 Calculating calories...',
        nutrition_advice: '🥗 Preparing nutrition advice...',
        progress_check: '📊 Checking your progress...',
        motivation: '🌟 Finding the right words...',
        general_health: '💭 Thinking...',
        unknown: '💭 Processing your question...'
    };

    return intent ? messages[intent] : messages.unknown;
}

/**
 * Get typing message for image analysis
 */
export function getImageTypingMessage(): string {
    return '📸 Analyzing your food photo...';
}

/**
 * Get typing message for API calls
 */
export function getAPITypingMessage(type: 'workout' | 'food' | 'generic'): string {
    const messages = {
        workout: '🏋️ Generating personalized workout...',
        food: '🍽️ Analyzing food composition...',
        generic: '⚡ Processing...'
    };

    return messages[type];
}
