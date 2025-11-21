// Progress Check Handler
import type { IntentHandler, DetectedIntent, HandlerContext, HandlerResponse } from './base';
import { getTemplateManager } from '../responseTemplates';

export class ProgressCheckHandler implements IntentHandler {
    category = 'progress_check' as const;

    async handle(
        query: string,
        intent: DetectedIntent,
        context?: HandlerContext
    ): Promise<HandlerResponse> {
        const templates = getTemplateManager();
        const normalized = query.toLowerCase();

        // Register progress-specific templates
        templates.register('progress_check', 'weekly_summary', {
            id: 'weekly_summary',
            template: `📊 **Weekly Progress Summary**

Based on your activity this week:
- 🏋️ Workouts: {workouts} sessions
- 🍽️ Calories avg: {calories} kcal/day
- ⭐ Consistency: {consistency}%

[TIP] Keep up the momentum! Small daily actions lead to big results.`,
            variables: ['workouts', 'calories', 'consistency']
        });

        templates.register('progress_check', 'goal_status', {
            id: 'goal_status',
            template: `🎯 **Goal Progress**

Current: {current} kg
Target: {target} kg
Progress: [PROGRESS:{current}:{target}:Weight Goal]

You're {percentage}% to your goal! {encouragement}`,
            variables: ['current', 'target', 'percentage', 'encouragement']
        });

        templates.register('progress_check', 'trend_analysis', {
            id: 'trend_analysis',
            template: `📈 **Your Trend Analysis**

**This Month:**
- Weight: {trend} kg
- Average calories: {avgCal} kcal
- Workout frequency: {workoutFreq}/week

[HIGHLIGHT]Biggest win: {biggestWin}[/HIGHLIGHT]

Keep tracking to see even better patterns! 💪`,
            variables: ['trend', 'avgCal', 'workoutFreq', 'biggestWin']
        });

        templates.register('progress_check', 'comparison', {
            id: 'comparison',
            template: `🔄 **This Week vs Last Week**

**Weight:** {thisWeight} kg vs {lastWeight} kg ({diff})
**Workouts:** {thisWorkouts} vs {lastWorkouts} sessions
**Calories:** {thisCal} vs {lastCal} kcal/day

{verdict}`,
            variables: ['thisWeight', 'lastWeight', 'diff', 'thisWorkouts', 'lastWorkouts', 'thisCal', 'lastCal', 'verdict']
        });

        templates.register('progress_check', 'streak', {
            id: 'streak',
            template: `🔥 **Consistency Streak**

You're on a **{days}-day** streak! 

{milestone}

[TIP] Don't break the chain! Even 10 minutes counts.`,
            variables: ['days', 'milestone']
        });

        templates.register('progress_check', 'simple_check', {
            id: 'simple_check',
            template: `📊 **Quick Progress Check**

Great question! To see your detailed progress:
- Check the **Dashboard** for charts 📈
- Review **Food Diary** for nutrition trends 🍽️
- See **Workout Log** for exercise history 💪

[HIGHLIGHT]Keep logging daily for accurate insights![/HIGHLIGHT]`,
            variables: []
        });

        // Detect specific progress queries
        const userProfile = context?.userProfile;

        if (normalized.includes('week') || normalized.includes('summary')) {
            if (userProfile) {
                return {
                    content: templates.render('progress_check', 'weekly_summary', {
                        workouts: '4',
                        calories: '1850',
                        consistency: '85'
                    })
                };
            }
            return { content: templates.render('progress_check', 'simple_check', {}) };
        }

        if (normalized.includes('goal') || normalized.includes('target')) {
            if (userProfile?.weight) {
                const current = userProfile.weight;
                const target = userProfile.weight * 0.95; // Example
                const percentage = Math.round(((current - target) / current) * 100);

                return {
                    content: templates.render('progress_check', 'goal_status', {
                        current: current.toString(),
                        target: target.toFixed(1),
                        percentage: percentage.toString(),
                        encouragement: percentage > 50 ? 'Almost there!' : 'Great start!'
                    })
                };
            }
        }

        if (normalized.includes('streak') || normalized.includes('consistent')) {
            return {
                content: templates.render('progress_check', 'streak', {
                    days: '7',
                    milestone: '🎉 One week milestone! Keep going!'
                })
            };
        }

        // Default: simple progress check
        return { content: templates.render('progress_check', 'simple_check', {}) };
    }
}
