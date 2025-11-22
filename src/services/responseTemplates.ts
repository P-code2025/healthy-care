// Response Template System for AI Health Advisor Chatbot

import type { IntentCategoryName } from './intentDetector';

export interface ResponseTemplate {
    id: string;
    intent: IntentCategoryName;
    template: string;
    variables: string[];
    language?: 'en' | 'vi';
    description?: string;
}

export interface TemplateData {
    [key: string]: string | number | boolean | undefined;
}

/**
 * Template Manager
 * Stores and renders response templates with variable substitution
 */
export class TemplateManager {
    private templates: Map<string, ResponseTemplate> = new Map();

    constructor() {
        this.registerDefaultTemplates();
    }

    /**
     * Register default response templates
     */
    private registerDefaultTemplates(): void {
        // General Health Templates
        this.register({
            id: 'water_intake',
            intent: 'general_health',
            template: 'Based on your weight ({weight} kg), aim for **{amount}L** of water per day.\n\n💧 Tip: Drink before you feel thirsty!',
            variables: ['weight', 'amount'],
            description: 'Daily water intake recommendation'
        });

        this.register({
            id: 'rest_importance',
            intent: 'general_health',
            template: 'Rest is crucial for muscle growth and recovery! 💪\n\nYour muscles actually grow during rest, not during workouts. Aim for **{restDays} rest days per week** and get **7-9 hours** of sleep.',
            variables: ['restDays'],
            description: 'Rest and recovery advice'
        });

        this.register({
            id: 'workout_timing',
            intent: 'general_health',
            template: 'The best time to workout is **when you can be consistent**! 🕐\n\nThat said:\n- **Morning**: Boosts energy for the day\n- **Afternoon**: Peak physical performance\n- **Evening**: Good stress relief\n\nChoose what fits your schedule!',
            variables: [],
            description: 'Best workout timing'
        });

        // Motivation Templates
        this.register({
            id: 'encouragement_general',
            intent: 'motivation',
            template: 'You\'ve got this! 💪 Remember why you started.\n\n"{reason}"\n\nEvery small step counts. Keep going!',
            variables: ['reason'],
            description: 'General encouragement'
        });

        this.register({
            id: 'setback_recovery',
            intent: 'motivation',
            template: 'One setback doesn\'t define your journey! 🌟\n\nYou\'ve logged **{streakDays} days** this month. That\'s {streakDays} wins! Focus on progress, not perfection.\n\nGet back on track tomorrow - you\'ve got this!',
            variables: ['streakDays'],
            description: 'Recovery from setback'
        });

        this.register({
            id: 'celebration',
            intent: 'motivation',
            template: '🎉 Amazing work! You\'ve achieved **{achievement}**!\n\nThis is a huge milestone. Keep up the incredible effort! 💪✨',
            variables: ['achievement'],
            description: 'Celebrate achievement'
        });

        // Nutrition Templates
        this.register({
            id: 'protein_sources',
            intent: 'nutrition_advice',
            template: 'Great protein sources for your goal ({goal}):\n\n**Animal-based:**\n- Chicken breast (31g per 100g)\n- Eggs (13g per 100g)\n- Greek yogurt (10g per 100g)\n\n**Plant-based:**\n- Tofu (8g per 100g)\n- Lentils (9g per 100g)\n- Quinoa (4g per 100g)\n\nAim for **{proteinTarget}g** protein per day.',
            variables: ['goal', 'proteinTarget'],
            description: 'Protein source recommendations'
        });

        this.register({
            id: 'meal_timing',
            intent: 'nutrition_advice',
            template: 'For **{goal}** goals:\n\n🌅 **Breakfast**: High protein + complex carbs\n🌞 **Lunch**: Balanced macro split\n🌙 **Dinner**: Lighter, protein-focused\n\n⏰ **Workout nutrition:**\n- Before: Light carbs (30-60 min before)\n- After: Protein + carbs (within 2h)',
            variables: ['goal'],
            description: 'Meal timing advice'
        });

        // Progress Templates
        this.register({
            id: 'on_track',
            intent: 'progress_check',
            template: '📊 You\'re doing great!\n\n**Progress:** {progress}\n**Goal:** {goal}\n**Trend:** {trend}\n\nYou\'re **on track**! Keep up the consistency! 🎯',
            variables: ['progress', 'goal', 'trend'],
            description: 'Positive progress update'
        });

        this.register({
            id: 'plateau_advice',
            intent: 'progress_check',
            template: '📊 You\'ve hit a plateau. This is normal!\n\n**Options to break through:**\n1. Adjust calories by {calorieAdjust} kcal\n2. Change workout intensity\n3. Track more carefully for 2 weeks\n\nPlateaus are part of the journey. Stay patient! 💪',
            variables: ['calorieAdjust'],
            description: 'Plateau advice'
        });

        // Unknown Intent - Better fallback
        this.register({
            id: 'fallback',
            intent: 'unknown',
            template: 'I\'m your **AI Health Coach**! 🏥💪\n\nI can help with:\n\n🏋️ **Workouts** - "Create workout plan"\n🥗 **Nutrition** - "What should I eat?"\n📊 **Progress** - "Am I on track?"\n💪 **Motivation** - "I feel tired"\n💧 **Health tips** - "How much water?"\n\n_Note: I specialize in health & fitness. For other topics (math, coding, etc.), please use a general AI!_',
            variables: [],
            description: 'Fallback for unknown intents'
        });
    }

    /**
     * Register a new template
     */
    register(template: ResponseTemplate): void {
        this.templates.set(template.id, template);
    }

    /**
     * Get template by ID
     */
    getTemplate(id: string): ResponseTemplate | undefined {
        return this.templates.get(id);
    }

    /**
     * Get all templates for an intent
     */
    getTemplatesForIntent(intent: IntentCategoryName): ResponseTemplate[] {
        return Array.from(this.templates.values()).filter(t => t.intent === intent);
    }

    /**
     * Render template with data
     */
    render(template: ResponseTemplate, data: TemplateData): string {
        let result = template.template;

        // Replace variables
        // Replace variables
        if (template.variables && Array.isArray(template.variables)) {
            for (const variable of template.variables) {
                const value = data[variable];
                if (value !== undefined) {
                    const placeholder = `{${variable}}`;
                    result = result.replace(new RegExp(placeholder, 'g'), String(value));
                }
            }
        }

        return result;
    }

    /**
     * Render template by ID
     */
    renderById(templateId: string, data: TemplateData): string | null {
        const template = this.getTemplate(templateId);
        if (!template) return null;
        return this.render(template, data);
    }

    /**
     * Get a random template for an intent
     */
    getRandomTemplate(intent: IntentCategoryName): ResponseTemplate | undefined {
        const templates = this.getTemplatesForIntent(intent);
        if (templates.length === 0) return undefined;
        return templates[Math.floor(Math.random() * templates.length)];
    }

    /**
     * Check if template has all required variables
     */
    validateData(template: ResponseTemplate, data: TemplateData): boolean {
        return template.variables.every(variable => data[variable] !== undefined);
    }

    /**
     * Get all registered templates
     */
    getAllTemplates(): ResponseTemplate[] {
        return Array.from(this.templates.values());
    }
}

// Singleton instance
let templateManagerInstance: TemplateManager | null = null;

/**
 * Get or create the global template manager
 */
export function getTemplateManager(): TemplateManager {
    if (!templateManagerInstance) {
        templateManagerInstance = new TemplateManager();
    }
    return templateManagerInstance;
}

/**
 * Reset the global template manager (for testing)
 */
export function resetTemplateManager(): void {
    templateManagerInstance = null;
}
