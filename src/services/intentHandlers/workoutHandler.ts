// Workout Handler
import type { IntentHandler, DetectedIntent, HandlerContext, HandlerResponse } from './base';
import { getTemplateManager } from '../responseTemplates';

export class WorkoutHandler implements IntentHandler {
    category = 'workout_plan' as const;

    async handle(
        query: string,
        intent: DetectedIntent,
        context?: HandlerContext
    ): Promise<HandlerResponse> {
        const templates = getTemplateManager();
        const normalized = query.toLowerCase();

        // Register workout templates
        templates.register('workout_plan', 'beginner_tips', {
            id: 'beginner_tips',
            template: `🎯 **Beginner Workout Tips**

**Week 1-2: Form First**
- Focus on learning proper form
- Use light weights or bodyweight
- 3 days/week, 30 minutes

**Basic routine:**
1. Warm-up: 5-10 min cardio
2. Squats: 3 sets × 10 reps
3. Push-ups: 3 sets × 8 reps
4. Planks: 3 sets × 30 sec
5. Cool-down: 5 min stretch

[WARNING] Don't skip warm-up - injury prevention is key!

[TIP] Film yourself to check form or ask a trainer.`,
            variables: []
        });

        templates.register('workout_plan', 'home_workout', {
            id: 'home_workout',
            template: `🏠 **Effective Home Workout**

**No equipment needed:**

**Circuit (3 rounds):**
1. Bodyweight squats: 15 reps
2. Push-ups: 10 reps
3. Lunges: 10 each leg
4. Plank: 30 seconds
5. Jumping jacks: 20 reps

**Rest:** 60 sec between circuits
**Duration:** 20-25 minutes

[HIGHLIGHT]Consistency beats perfection - do what you can![/HIGHLIGHT]`,
            variables: []
        });

        templates.register('workout_plan', 'gym_routine', {
            id: 'gym_routine',
            template: `🏋️ **3-Day Gym Split**

**Day 1: Push (Chest, Shoulders, Triceps)**
- Bench press: 4×8
- Shoulder press: 3×10
- Tricep dips: 3×12

**Day 2: Pull (Back, Biceps)**
- Deadlift: 4×6
- Pull-ups: 3×8
- Bicep curls: 3×12

**Day 3: Legs**
- Squats: 4×8
- Leg press: 3×12
- Calf raises: 3×15

[TIP] Rest 48h between same muscle groups.`,
            variables: []
        });

        templates.register('workout_plan', 'cardio_guide', {
            id: 'cardio_guide',
            template: `🏃 **Cardio Training Guide**

**For Fat Loss:**
- HIIT: 20-30 min, 3×/week
- Example: 30sec sprint, 90sec walk × 10 rounds

**For Endurance:**
- Steady-state: 45-60 min, 3-4×/week
- Zone 2 (can talk comfortably)

**Mix it up:**
- Running
- Cycling
- Swimming
- Jump rope

[TIP] Don't overdo cardio - 3-4 sessions/week max!`,
            variables: []
        });

        templates.register('workout_plan', 'recovery', {
            id: 'recovery',
            template: `😴 **Recovery is Training Too!**

**Active Recovery Days:**
- Light walking (20-30 min)
- Yoga or stretching
- Swimming (easy pace)

**Sleep:**
- Aim for 7-9 hours
- Muscle growth happens during sleep

**Nutrition:**
- Protein within 2h post-workout
- Stay hydrated (3L+ water/day)

**Listen to your body:**
- Sore = normal
- Pain = STOP and rest

[HIGHLIGHT]Rest days prevent burnout and injury![/HIGHLIGHT]`,
            variables: []
        });

        templates.register('workout_plan', 'form_tips', {
            id: 'form_tips',
            template: `✅ **Perfect Form Checklist**

**Squats:**
- Feet shoulder-width apart
- Chest up, core tight
- Knees track over toes
- Go below parallel

**Push-ups:**
- Hands shoulder-width
- Body in straight line
- Elbows at 45° angle
- Full range of motion

**Deadlifts:**
- Neutral spine
- Lift with legs, not back
- Bar close to shins
- Lock out at top

[WARNING] Bad form = injuries. Ask for help if unsure!`,
            variables: []
        });

        templates.register('workout_plan', 'progression', {
            id: 'progression',
            template: `📈 **Progressive Overload**

**How to progress:**
1. **Add weight:** +2.5-5kg when you hit target reps
2. **Add reps:** From 8 to 12 before adding weight
3. **Add sets:** Extra set when comfortable
4. **Decrease rest:** From 90s to 60s between sets

**Example progression:**
- Week 1-2: 3×8 @ 20kg
- Week 3-4: 3×10 @ 20kg
- Week 5-6: 3×12 @ 20kg
- Week 7+: 3×8 @ 22.5kg

[TIP] Track every workout to see progress!`,
            variables: []
        });

        templates.register('workout_plan', 'quick_workout', {
            id: 'quick_workout',
            template: `⚡ **10-Minute Workout**

**When you're short on time:**

**AMRAP (As Many Rounds As Possible):**
1. Burpees: 5 reps
2. Squats: 10 reps
3. Push-ups: 5 reps
4. Mountain climbers: 20 reps

**Set timer for 10 minutes and go!**

[HIGHLIGHT]Something is better than nothing![/HIGHLIGHT]

Aim for 4-6 rounds.`,
            variables: []
        });

        templates.register('workout_plan', 'workout_tips', {
            id: 'workout_tips',
            template: `💪 **Essential Workout Tips**

**Before Workout:**
- Warm up 5-10 minutes
- Dynamic stretching
- Hydrate well

**During Workout:**
- Focus on form over weight
- Breathe properly (exhale on effort)
- Rest 60-90 seconds between sets

**After Workout:**
- Cool down & stretch
- Protein within 2 hours
- Log your workout!

[TIP] Progressive overload is key - gradually increase weight/reps.`,
            variables: []
        });

        // Detect specific workout queries
        if (normalized.includes('beginner') || normalized.includes('start')) {
            return { content: templates.render('workout_plan', 'beginner_tips', {}) };
        }

        if (normalized.includes('home') || normalized.includes('no gym')) {
            return { content: templates.render('workout_plan', 'home_workout', {}) };
        }

        if (normalized.includes('gym') || normalized.includes('split')) {
            return { content: templates.render('workout_plan', 'gym_routine', {}) };
        }

        if (normalized.includes('cardio') || normalized.includes('running')) {
            return { content: templates.render('workout_plan', 'cardio_guide', {}) };
        }

        if (normalized.includes('recovery') || normalized.includes('rest')) {
            return { content: templates.render('workout_plan', 'recovery', {}) };
        }

        if (normalized.includes('form') || normalized.includes('technique')) {
            return { content: templates.render('workout_plan', 'form_tips', {}) };
        }

        if (normalized.includes('progress') || normalized.includes('overload')) {
            return { content: templates.render('workout_plan', 'progression', {}) };
        }

        if (normalized.includes('quick') || normalized.includes('short') || normalized.includes('10 min')) {
            return { content: templates.render('workout_plan', 'quick_workout', {}) };
        }

        // Default: workout tips
        return { content: templates.render('workout_plan', 'workout_tips', {}) };
    }
}
