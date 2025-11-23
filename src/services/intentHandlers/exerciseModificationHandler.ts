import type { IntentHandler, HandlerContext, HandlerResponse } from './base';
import type { DetectedIntent } from '../intentDetector';
import { http } from '../http';


export class ExerciseModificationHandler implements IntentHandler {
    readonly intent = 'exercise_modification' as const;
    category = 'exercise_modification' as const;

    canHandle(intent: DetectedIntent, _context: HandlerContext): boolean {
        return intent.category === 'exercise_modification';
    }

    async handle(
        query: string,
        _intent: DetectedIntent,
        _context?: HandlerContext
    ): Promise<HandlerResponse> {
        try {
            const constraints = this.extractConstraints(query);

            const dailyIntake = await this.getDailyCalorieIntake();

            const response = await http.post<any>('/api/exercise-plan/modify', {
                constraints,
                dailyIntake,
                userQuery: query,
            });

            return {
                content: this.formatExercisePlan(response, constraints),
            };
        } catch (error: any) {
            console.error('Exercise modification handler error:', error);
            return {
                content: `❌ **Error**\n\nSorry, I couldn't modify your exercise plan: ${error.message}\n\nPlease try again or rephrase your request.`,
            };
        }
    }

    private extractConstraints(query: string): {
        intensity?: 'light' | 'moderate' | 'intense';
        excludeTypes?: string[];
        userQuery: string;
    } {
        const normalized = query.toLowerCase();
        const constraints: any = { userQuery: query };

        if (normalized.match(/nhe|nhẹ|light|easy|easier|gentle/)) {
            constraints.intensity = 'light';
        } else if (normalized.match(/nang|nặng|hard|harder|intense|difficult/)) {
            constraints.intensity = 'intense';
        }

        const excludeTypes: string[] = [];

        if (normalized.match(/dau chan|đau chân|leg pain|sore legs/)) {
            excludeTypes.push('leg exercises');
            excludeTypes.push('squats');
            excludeTypes.push('lunges');
            excludeTypes.push('running');
            if (!constraints.intensity) constraints.intensity = 'light';
        }

        if (normalized.match(/dau tay|đau tay|arm pain|sore arms/)) {
            excludeTypes.push('arm exercises');
            excludeTypes.push('push-ups');
            excludeTypes.push('pull-ups');
            if (!constraints.intensity) constraints.intensity = 'light';
        }

        if (normalized.match(/dau lung|đau lưng|back pain/)) {
            excludeTypes.push('deadlifts');
            excludeTypes.push('back exercises');
            if (!constraints.intensity) constraints.intensity = 'light';
        }

        if (normalized.match(/met|mệt|tired|fatigue|exhausted/)) {
            excludeTypes.push('HIIT');
            excludeTypes.push('high intensity');
            if (!constraints.intensity) constraints.intensity = 'light';
        }

        if (excludeTypes.length > 0) {
            constraints.excludeTypes = excludeTypes;
        }

        return constraints;
    }

    private async getDailyCalorieIntake(): Promise<number> {
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await http.get<any>(`/api/food-log?date=${today}`);

            const totalCalories = (response.logs || []).reduce(
                (sum: number, log: any) => sum + (log.calories || 0),
                0
            );

            return totalCalories;
        } catch (error) {
            console.error('Failed to get daily calorie intake:', error);
            return 0; 
        }
    }

    private formatExercisePlan(plan: any, constraints: any): string {
        const intensityEmoji = {
            light: '🌱',
            moderate: '💪',
            intense: '🔥',
        };

        const emoji = intensityEmoji[plan.intensity as keyof typeof intensityEmoji] || '💪';

        let response = `${emoji} **Exercise Plan Updated!**\n\n`;
        response += `📊 Intensity: ${plan.intensity}\n`;
        response += `🔥 Estimated burn: ${plan.totalBurnEstimate}\n\n`;

        if (plan.summary) {
            response += `${plan.summary}\n\n`;
        }

        if (plan.exercises && plan.exercises.length > 0) {
            response += `**Today's Exercises:**\n\n`;
            plan.exercises.forEach((exercise: any, index: number) => {
                response += `${index + 1}. **${exercise.name}** (${exercise.duration})\n`;
                if (exercise.reason) {
                    response += `   _${exercise.reason}_\n`;
                }
                response += '\n';
            });
        }

        if (plan.advice) {
            response += `💡 **Advice:** ${plan.advice}\n\n`;
        }

        if (constraints.excludeTypes && constraints.excludeTypes.length > 0) {
            response += `✅ Excluded: ${constraints.excludeTypes.join(', ')}\n`;
        }

        return response.trim();
    }
}
