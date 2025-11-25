// Workout Handler
import type { IntentHandler, HandlerContext, HandlerResponse } from './base';
import { getTemplateManager } from '../responseTemplates';
import type { DetectedIntent } from '../intentDetector';
import type { ToolContext } from '../tools/base';
import type { ResponseTemplate, TemplateData } from '../responseTemplates'; // Thêm import này

export class WorkoutHandler implements IntentHandler {
    intent = 'workout_plan' as const;
    category = 'workout_plan' as const;

    private templates = getTemplateManager();

    canHandle(intent: DetectedIntent, _context: HandlerContext): boolean {
        return intent.category === this.category;
    }

    async handle(
        query: string,
        intent: DetectedIntent,
        context?: HandlerContext
    ): Promise<HandlerResponse> {
        const normalized = query.toLowerCase();

        // === ĐĂNG KÝ TẤT CẢ TEMPLATE (giữ nguyên nội dung của bạn) ===
        this.templates.register({
            id: 'beginner_tips',
            intent: 'workout_plan',
            template: `**Beginner Workout Tips**

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

        this.templates.register({
            id: 'home_workout',
            intent: 'workout_plan',
            template: `**Effective Home Workout**

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

        this.templates.register({
            id: 'gym_routine',
            intent: 'workout_plan',
            template: `**3-Day Gym Split**

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

        this.templates.register({
            id: 'cardio_guide',
            intent: 'workout_plan',
            template: `**Cardio Training Guide**

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

        this.templates.register({
            id: 'recovery',
            intent: 'workout_plan',
            template: `**Recovery is Training Too!**

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

        this.templates.register({
            id: 'form_tips',
            intent: 'workout_plan',
            template: `**Perfect Form Checklist**

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

        this.templates.register({
            id: 'progression',
            intent: 'workout_plan',
            template: `**Progressive Overload**

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

        this.templates.register({
            id: 'quick_workout',
            intent: 'workout_plan',
            template: `**10-Minute Workout**

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

        this.templates.register({
            id: 'workout_tips',
            intent: 'workout_plan',
            template: `**Essential Workout Tips**

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

        // === HELPER ĐỂ RENDER ĐÚNG 5 THAM SỐ ===
        const render = (id: string, data: TemplateData = {}): string => {
            // Lấy template object đã đăng ký
            const templateObj = this.templates['templates']?.get(id) 
                ?? Array.from(this.templates['templates']?.values() ?? []).find(t => t.id === id);

            if (!templateObj) {
                throw new Error(`Template with id "${id}" not found`);
            }

            return this.templates.render(
                'workout_plan',   // p0
                id,               // p1
                {},               // p2 - variables (có thể mở rộng sau)
                templateObj,      // p3 - ResponseTemplate object (bắt buộc!)
                data              // p4 - TemplateData bổ sung
            );
        };

        // === XỬ LÝ QUERY ===
        if (normalized.includes('beginner') || normalized.includes('start')) {
            return { content: render('beginner_tips') };
        }
        if (normalized.includes('home') || normalized.includes('no gym')) {
            return { content: render('home_workout') };
        }
        if (normalized.includes('gym') || normalized.includes('split')) {
            return { content: render('gym_routine') };
        }
        if (normalized.includes('cardio') || normalized.includes('running')) {
            return { content: render('cardio_guide') };
        }
        if (normalized.includes('recovery') || normalized.includes('rest')) {
            return { content: render('recovery') };
        }
        if (normalized.includes('form') || normalized.includes('technique')) {
            return { content: render('form_tips') };
        }
        if (normalized.includes('progress') || normalized.includes('overload')) {
            return { content: render('progression') };
        }
        if (normalized.includes('quick') || normalized.includes('short') || normalized.includes('10 min')) {
            return { content: render('quick_workout') };
        }

        // Default
        return { content: render('workout_tips') };
    }
}