import { BaseIntentHandler, type HandlerContext, type HandlerResponse } from './base';
import type { DetectedIntent } from '../intentDetector';
import { getTemplateManager } from '../responseTemplates';

export class MotivationHandler extends BaseIntentHandler {
    readonly intent = 'motivation' as const;

    async handle(query: string, intent: DetectedIntent, context: HandlerContext): Promise<HandlerResponse> {
        const templateManager = getTemplateManager();
        const normalized = query.toLowerCase();

        if (normalized.includes('fail') || normalized.includes('cheat') || normalized.includes('give up') || normalized.includes('bỏ cuộc')) {
            const streakDays = 18; 
            const response = templateManager.renderById('setback_recovery', { streakDays });
            return this.createResponse(response || 'One setback doesn\'t define your journey! Keep going! 💪');
        }

        if (normalized.includes('celebrate') || normalized.includes('achievement') || normalized.includes('success')) {
            const achievement = 'staying consistent';
            const response = templateManager.renderById('celebration', { achievement });
            return this.createResponse(response || '🎉 Amazing work! Keep up the great effort!');
        }

        if (normalized.includes('tired') || normalized.includes('mệt') || normalized.includes('exhaust')) {
            return this.createResponse(
                'Feeling tired? Listen to your body! 💚\n\n' +
                '**Options:**\n' +
                '- Take a rest day (recovery is growth!)\n' +
                '- Light activity (walk, stretch)\n' +
                '- Check your sleep (aim for 7-9h)\n\n' +
                'Rest is not weakness - it\'s wisdom!'
            );
        }

        const reason = context.userProfile?.goal || 'your health journey';
        const response = templateManager.renderById('encouragement_general', { reason });
        return this.createResponse(
            response || 'You\'ve got this! 💪 Remember why you started. Every small step counts!'
        );
    }
}
