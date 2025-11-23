import type { IntentHandler, HandlerContext, HandlerResponse } from './base';
import type { DetectedIntent } from '../intentDetector';

import { chatWithClova } from '../aiService';

export class UnknownHandler implements IntentHandler {
    readonly intent = 'unknown' as const;
    category = 'unknown' as const; 

    canHandle(intent: DetectedIntent, _context: HandlerContext): boolean {
        return intent.category === 'unknown' || intent.confidence < 0.2;
    }

    async handle(
        query: string,
        _intent: DetectedIntent,
        context?: HandlerContext
    ): Promise<HandlerResponse> {
        try {
            const userProfile = context?.userProfile ? {
                age: context.userProfile.age || 0,
                weight: context.userProfile.weight || 0,
                height: context.userProfile.height || 0,
                gender: context.userProfile.gender || 'Male',
                goal: context.userProfile.goal || 'maintain',
                workoutDays: context.userProfile.workoutDays || 3
            } : undefined;

            const aiResponse = await chatWithClova(
                query,
                context?.chatHistory || [],
                userProfile
            );
            return {
                content: aiResponse
            };
        } catch (error) {
            console.error('Fallback AI failed:', error);
            return {
                content: `Hello! I'm your **AI Health Consultant Expert** 🏥✨

I can help you with:

🏋️ **Workout Plans** - "Create a gym plan for beginners"
🥗 **Nutrition Advice** - "What should I eat to increase protein?"
📊 **Progress Tracking** - "Check my progress this week"
💪 **Motivation** - "I feel discouraged, motivate me"
💧 **General Health** - "How much water should I drink daily?"
🍽️ **Meal Analysis** - "Analyze my meal today"
📅 **Planning** - "Help me plan my meals for the week"

💡 **Tip:** For the best personalized advice, complete your profile (age, weight, height, goals).

_⚕️ Note: I specialize in health, nutrition & fitness. For serious medical issues, please consult a medical professional._`
            };
        }
    }
}
