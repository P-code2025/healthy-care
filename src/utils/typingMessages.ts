import type { IntentCategoryName } from '../services/intentDetector';

export function getTypingMessage(intent?: IntentCategoryName): string {
    const messages: Record<IntentCategoryName, string> = {
        food_analysis: '🔍 Analyzing your meal...',
        workout_plan: '💪 Crafting your workout plan...',
        calorie_query: '🧮 Calculating calories...',
        nutrition_advice: '🥗 Preparing nutrition advice...',
        progress_check: '📊 Checking your progress...',
        motivation: '🌟 Finding the right words...',
        general_health: '💭 Thinking...',
        unknown: '💭 Processing your question...',
        meal_plan_request: '',
        meal_plan_modification: '',
        exercise_modification: ''
    };

    return intent ? messages[intent] : messages.unknown;
}

export function getImageTypingMessage(): string {
    return '📸 Analyzing your food photo...';
}

export function getAPITypingMessage(type: 'workout' | 'food' | 'generic'): string {
    const messages = {
        workout: '🏋️ Generating personalized workout...',
        food: '🍽️ Analyzing food composition...',
        generic: '⚡ Processing...'
    };

    return messages[type];
}
