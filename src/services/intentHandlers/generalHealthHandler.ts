// General Health Handler - Uses templates for common health questions

import { BaseIntentHandler, type HandlerContext, type HandlerResponse } from './base';
import type { DetectedIntent } from '../intentDetector';
import { getTemplateManager } from '../responseTemplates';

export class GeneralHealthHandler extends BaseIntentHandler {
    readonly intent = 'general_health' as const;

    async handle(query: string, intent: DetectedIntent, context: HandlerContext): Promise<HandlerResponse> {
        const templateManager = getTemplateManager();
        const normalized = query.toLowerCase();

        // Water intake question
        if (normalized.includes('water') || normalized.includes('drink') || normalized.includes('hydra')) {
            const weight = context.userProfile?.weight || 70;
            const amount = Math.round((weight * 0.033) * 10) / 10; // 33ml per kg

            const response = templateManager.renderById('water_intake', { weight, amount });
            return this.createResponse(response || 'Aim for 2-3L of water per day.');
        }

        // Rest/recovery question
        if (normalized.includes('rest') || normalized.includes('recovery') || normalized.includes('sleep')) {
            const restDays = 2;
            const response = templateManager.renderById('rest_importance', { restDays });
            return this.createResponse(response || 'Rest is crucial! Aim for 1-2 rest days per week.');
        }

        // Workout timing
        if (normalized.includes('when') && (normalized.includes('workout') || normalized.includes('exercise'))) {
            const response = templateManager.renderById('workout_timing', {});
            return this.createResponse(response || 'The best time is when you can be consistent!');
        }

        // Fallback to general template
        const templates = templateManager.getTemplatesForIntent('general_health');
        if (templates.length > 0) {
            const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
            const response = templateManager.render(randomTemplate, context.userProfile || {});
            return this.createResponse(response);
        }

        return this.createResponse(
            'That\'s a great question! For specific health concerns, please consult with a healthcare professional. I can help with general fitness and nutrition advice.'
        );
    }
}
