export type IntentCategoryName =
    | 'food_analysis'
    | 'workout_plan'
    | 'calorie_query'
    | 'nutrition_advice'
    | 'progress_check'
    | 'motivation'
    | 'general_health'
    | 'meal_plan_request'
    | 'meal_plan_modification'
    | 'exercise_modification'
    | 'unknown';

export interface IntentCategory {
    name: IntentCategoryName;
    keywords: string[];
    requiredContext?: string[];
    priority: number;
    description: string;
}

export interface DetectedIntent {
    category: IntentCategoryName;
    confidence: number;
    matchedKeywords: string[];
    metadata?: Record<string, any>;
}

export interface ChatContext {
    hasImage?: boolean;
    lastIntent?: IntentCategoryName;
    recentTopics?: string[];
    messageCount?: number;
}


export class IntentDetector {
    private categories: IntentCategory[] = [];
    private readonly CONFIDENCE_THRESHOLD = 0.2;

    constructor() {
        this.registerDefaultIntents();
    }


    private registerDefaultIntents(): void {
        this.registerIntent({
            name: 'food_analysis',
            keywords: ['analyze', 'what is', 'identify', 'scan', 'recognize', 'this food'],
            priority: 10,
            description: 'Analyze food from image'
        });

        this.registerIntent({
            name: 'workout_plan',
            keywords: [
                'workout', 'exercise', 'plan', 'routine', 'training',
                'tap', 'lich', 'goi y', 'suggest',
                'gym', 'fitness', 'muscle', 'cardio',
                'dau', 'moi', 'ache', 'sore'
            ],
            priority: 8,
            description: 'Create or modify workout plan'
        });

        this.registerIntent({
            name: 'calorie_query',
            keywords: [
                'calorie', 'calo', 'kcal',
                'today', 'hom nay', 'hôm nay', 'nay',
                'eat', 'consumed', 'intake'
            ],
            priority: 7,
            description: 'Query daily calorie intake'
        });

        this.registerIntent({
            name: 'nutrition_advice',
            keywords: [
                'should i eat', 'meal plan', 'diet', 'macro', 'protein', 'carbs', 'fat',
                'an gi', 'ăn gì', 'thuc don', 'thực đơn',
                'breakfast', 'lunch', 'dinner', 'snack',
                'vegetarian', 'vegan', 'keto'
            ],
            priority: 6,
            description: 'Nutritional guidance and meal planning'
        });

        this.registerIntent({
            name: 'progress_check',
            keywords: [
                'progress', 'track', 'goal', 'compare', 'trend',
                'am i', 'how much', 'weight', 'lose', 'gain',
                'tien do', 'tiến độ', 'kiem tra', 'kiểm tra'
            ],
            priority: 5,
            description: 'Check progress toward goals'
        });

        this.registerIntent({
            name: 'motivation',
            keywords: [
                'tired', 'give up', 'hard', 'difficult', 'discourage',
                'celebrate', 'achievement', 'success', 'fail',
                'met', 'mệt', 'kho', 'khó', 'bo cuoc', 'bỏ cuộc'
            ],
            priority: 4,
            description: 'Motivation and emotional support'
        });

        this.registerIntent({
            name: 'general_health',
            keywords: [
                'how much', 'should i', 'best time', 'does', 'is it',
                'water', 'sleep', 'rest', 'supplement', 'vitamin',
                'health', 'tip', 'advice', 'recommend'
            ],
            priority: 3,
            description: 'General health questions'
        });

        this.registerIntent({
            name: 'meal_plan_request',
            keywords: [
                'meal plan', 'thuc don', 'thực đơn', 'weekly plan', 'week plan',
                'tao thuc don', 'tạo thực đơn', 'gen thuc don', 'generate meal',
                'plan mon an', 'kế hoạch ăn', 'food plan', 'diet plan'
            ],
            priority: 9,
            description: 'Request to generate weekly meal plan'
        });

        this.registerIntent({
            name: 'meal_plan_modification',
            keywords: [
                'khong thich', 'không thích', 'don\'t like', 'hate', 'dislike',
                'doi mon', 'đổi món', 'thay mon', 'thay món', 'change meal',
                'replace meal', 'different meal', 'other meal', 'khac', 'khác',
                'thu 2', 'thứ 2', 'thu 3', 'thứ 3', 'monday', 'tuesday',
                'bua sang', 'bữa sáng', 'bua trua', 'bữa trưa', 'bua toi', 'bữa tối',
                'breakfast', 'lunch', 'dinner', 'snack'
            ],
            priority: 8,
            description: 'Modify specific meal in plan'
        });

        this.registerIntent({
            name: 'exercise_modification',
            keywords: [
                'dau chan', 'đau chân', 'dau tay', 'đau tay', 'leg pain', 'arm pain',
                'mat moi', 'mệt mỏi', 'tired', 'fatigue', 'sore',
                'nhe hon', 'nhẹ hơn', 'nang hon', 'nặng hơn', 'lighter', 'harder',
                'easier', 'more intense', 'less intense',
                'tap nhe', 'tập nhẹ', 'tap nang', 'tập nặng', 'light workout', 'hard workout',
                'bo bai tap', 'bỏ bài tập', 'remove exercise', 'skip exercise'
            ],
            priority: 8,
            description: 'Modify exercise plan based on conditions'
        });
    }


    registerIntent(category: IntentCategory): void {
        this.categories.push(category);
        this.categories.sort((a, b) => b.priority - a.priority);
    }


    detect(query: string, context: ChatContext = {}): DetectedIntent {
        const normalized = query.toLowerCase().trim();

        if (context.hasImage) {
            return {
                category: 'food_analysis',
                confidence: 1.0,
                matchedKeywords: ['<image>'],
                metadata: { source: 'image_context' }
            };
        }

        const modifiers = ['harder', 'easier', 'more', 'less', 'different', 'another', 'change'];
        const hasModifier = modifiers.some(m => normalized.includes(m));

        if (hasModifier && context.lastIntent && context.lastIntent !== 'unknown') {
            return {
                category: context.lastIntent,
                confidence: 0.9,
                matchedKeywords: modifiers.filter(m => normalized.includes(m)),
                metadata: { source: 'follow_up', original_intent: context.lastIntent }
            };
        }

        const scores = this.categories.map(category => ({
            category,
            ...this.scoreIntent(normalized, category, context)
        }));

        const best = scores.sort((a, b) => b.confidence - a.confidence)[0];

        if (best.confidence < this.CONFIDENCE_THRESHOLD) {
            return {
                category: 'unknown',
                confidence: 0,
                matchedKeywords: [],
                metadata: { all_scores: scores.map(s => ({ name: s.category.name, score: s.confidence })) }
            };
        }

        return {
            category: best.category.name,
            confidence: best.confidence,
            matchedKeywords: best.matchedKeywords,
            metadata: { source: 'keyword_match' }
        };
    }


    private scoreIntent(
        query: string,
        category: IntentCategory,
        context: ChatContext
    ): { confidence: number; matchedKeywords: string[] } {
        const matchedKeywords: string[] = [];
        let score = 0;

        for (const keyword of category.keywords) {
            if (query.includes(keyword)) {
                matchedKeywords.push(keyword);
                score += 2.0;
                if (keyword.length > 6) {
                    score += 1.0;
                }
            }
        }

        if (matchedKeywords.length === 0) {
            return { confidence: 0, matchedKeywords: [] };
        }

        const matchRatio = matchedKeywords.length / category.keywords.length;
        score *= (1 + matchRatio);

        if (context.recentTopics?.some(topic =>
            category.keywords.some(kw => topic.toLowerCase().includes(kw))
        )) {
            score *= 1.2;
        }

        const confidence = Math.min(1.0, score / 8);

        if (matchedKeywords.length > 0) {
            console.log(`  ${category.name}: matched=[${matchedKeywords.join(', ')}] score=${score.toFixed(2)} conf=${confidence.toFixed(2)}`);
        }

        return { confidence, matchedKeywords };
    }


    getCategories(): IntentCategory[] {
        return [...this.categories];
    }


    getCategory(name: IntentCategoryName): IntentCategory | undefined {
        return this.categories.find(c => c.name === name);
    }
}

let detectorInstance: IntentDetector | null = null;


export function getIntentDetector(): IntentDetector {
    if (!detectorInstance) {
        detectorInstance = new IntentDetector();
    }
    return detectorInstance;
}


export function resetIntentDetector(): void {
    detectorInstance = null;
}
