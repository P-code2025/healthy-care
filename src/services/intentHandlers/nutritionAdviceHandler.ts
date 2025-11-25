// Nutrition Advice Handler
import type { IntentHandler, DetectedIntent, HandlerContext, HandlerResponse } from './base';
import { getTemplateManager } from '../responseTemplates';

export class NutritionAdviceHandler implements IntentHandler {
    category = 'nutrition_advice' as const;

    async handle(
        query: string,
        intent: DetectedIntent,
        context?: HandlerContext
    ): Promise<HandlerResponse> {
        const templates = getTemplateManager();
        const normalized = query.toLowerCase();

        // Register nutrition templates
        templates.register('nutrition_advice', 'protein_sources', {
            id: 'protein_sources',
            template: `🥩 **Best Protein Sources**

**Animal-based:**
- Chicken breast: 31g per 100g
- Eggs: 13g per 100g  
- Greek yogurt: 10g per 100g

**Plant-based:**
- Lentils: 9g per 100g
- Tofu: 8g per 100g
- Chickpeas: 7g per 100g

[TIP] Aim for {target}g protein/day for your weight.`,
            variables: ['target']
        });

        templates.register('nutrition_advice', 'meal_timing', {
            id: 'meal_timing',
            template: `⏰ **Optimal Meal Timing**

**Pre-Workout (1-2h before):**
- Light carbs + protein
- Example: Banana + peanut butter

**Post-Workout (30-60min after):**
- Protein + carbs
- Example: Protein shake + rice

**General Tips:**
- Eat every 3-4 hours
- Don't skip breakfast
- Stop eating 2-3h before bed

[HIGHLIGHT]Consistency matters more than perfect timing![/HIGHLIGHT]`,
            variables: []
        });

        templates.register('nutrition_advice', 'healthy_snacks', {
            id: 'healthy_snacks',
            template: `🍎 **Healthy Snack Ideas**

**Under 100 kcal:**
- 🥕 Baby carrots + hummus
- 🍊 1 medium orange
- 🥚 1 boiled egg

**Under 200 kcal:**
- 🥜 Handful of almonds (15-20)
- 🍌 Banana + 1 tbsp peanut butter
- 🧀 String cheese + apple slices

[TIP] Prep snacks on Sunday for easy grab-and-go!`,
            variables: []
        });

        templates.register('nutrition_advice', 'meal_prep', {
            id: 'meal_prep',
            template: `🍱 **Meal Prep Guide**

**Sunday Prep (2-3 hours):**
1. Cook proteins: Grilled chicken, boiled eggs
2. Prep carbs: Rice, sweet potatoes, quinoa
3. Chop veggies: Broccoli, peppers, carrots
4. Portion into containers

**Easy Meal Formula:**
- 🥩 Protein (palm-sized)
- 🍚 Carbs (fist-sized)
- 🥦 Veggies (2 handfuls)
- 🥑 Healthy fat (thumb-sized)

[HIGHLIGHT]Meal prep saves 5+ hours per week![/HIGHLIGHT]`,
            variables: []
        });

        templates.register('nutrition_advice', 'hydration', {
            id: 'hydration',
            template: `💧 **Hydration Tips**

**Daily water goal:** {waterGoal}L

**Timing tips:**
- 🌅 Morning: 500ml upon waking
- 🏋️ Workout: 200ml every 15min
- 🍽️ Meals: 1 glass before eating
- 🌙 Evening: Stop 1h before bed

**Hydration signs:**
- ✅ Light yellow urine = good
- ❌ Dark yellow = drink more

[TIP] Set hourly reminders to sip water!`,
            variables: ['waterGoal']
        });

        templates.register('nutrition_advice', 'portion_control', {
            id: 'portion_control',
            template: `✋ **Portion Control Guide**

**Hand method:**
- **Protein:** Palm-sized (chicken, fish, tofu)
- **Carbs:** Fist-sized (rice, pasta, potatoes)
- **Fats:** Thumb-sized (nuts, oil, butter)
- **Veggies:** 2 handfuls (unlimited!)

**Plate method:**
- 🥦 50% vegetables
- 🥩 25% protein
- 🍚 25% carbs

[WARNING] Restaurant portions are often 2-3x normal!`,
            variables: []
        });

        templates.register('nutrition_advice', 'macros_balance', {
            id: 'macros_balance',
            template: `⚖️ **Macro Balance for {goal}**

**Recommended split:**
- Protein: {protein}% ({proteinG}g)
- Carbs: {carbs}% ({carbsG}g)
- Fats: {fats}% ({fatsG}g)

**Why this split?**
{reason}

[TIP] Track in your food diary for best results!`,
            variables: ['goal', 'protein', 'carbs', 'fats', 'proteinG', 'carbsG', 'fatsG', 'reason']
        });

        templates.register('nutrition_advice', 'eating_out', {
            id: 'eating_out',
            template: `🍽️ **Smart Restaurant Choices**

**General tips:**
- Ask for dressing on the side
- Choose grilled over fried
- Start with a salad
- Box half to-go immediately

**Best options by cuisine:**
- 🍣 Japanese: Sashimi, miso soup
- 🥗 Mediterranean: Grilled fish, Greek salad
- 🌮 Mexican: Fajitas (skip tortilla), burrito bowl

[HIGHLIGHT]Plan ahead by checking menu online![/HIGHLIGHT]`,
            variables: []
        });

        // Detect specific nutrition queries
        const userProfile = context?.userProfile;

        if (normalized.includes('protein')) {
            const target = userProfile?.weight ? Math.round(userProfile.weight * 1.6) : 100;
            return {
                content: templates.render('nutrition_advice', 'protein_sources', {
                    target: target.toString()
                })
            };
        }

        if (normalized.includes('snack')) {
            return { content: templates.render('nutrition_advice', 'healthy_snacks', {}) };
        }

        if (normalized.includes('meal prep') || normalized.includes('prep meal')) {
            return { content: templates.render('nutrition_advice', 'meal_prep', {}) };
        }

        if (normalized.includes('timing') || normalized.includes('when')) {
            return { content: templates.render('nutrition_advice', 'meal_timing', {}) };
        }

        if (normalized.includes('water') || normalized.includes('hydrat')) {
            const waterGoal = userProfile?.weight ? (userProfile.weight * 0.033).toFixed(1) : '2.5';
            return {
                content: templates.render('nutrition_advice', 'hydration', {
                    waterGoal
                })
            };
        }

        if (normalized.includes('portion')) {
            return { content: templates.render('nutrition_advice', 'portion_control', {}) };
        }

        if (normalized.includes('restaurant') || normalized.includes('eating out')) {
            return { content: templates.render('nutrition_advice', 'eating_out', {}) };
        }

        if (normalized.includes('macro')) {
            const goal = userProfile?.goal || 'maintenance';
            return {
                content: templates.render('nutrition_advice', 'macros_balance', {
                    goal,
                    protein: '30',
                    carbs: '40',
                    fats: '30',
                    proteinG: '150',
                    carbsG: '200',
                    fatsG: '67',
                    reason: 'Balanced for sustainable results'
                })
            };
        }

        // Default: healthy snacks
        return { content: templates.render('nutrition_advice', 'healthy_snacks', {}) };
    }
}
