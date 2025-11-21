// Quick Reply Suggestions Component
import type { IntentCategoryName } from '../services/intentDetector';
import styles from './QuickReplies.module.css';

interface QuickRepliesProps {
    intent: IntentCategoryName;
    lastQuery?: string;
    onReplyClick: (text: string) => void;
}

const REPLY_SUGGESTIONS: Record<IntentCategoryName, string[]> = {
    general_health: ['How much sleep?', 'Best meal timing?', 'Pre-workout tips?'],
    workout_plan: ['Make it harder', 'Make it easier', 'Different exercises'],
    motivation: ['Set a goal', 'Track progress', 'Stay motivated'],
    nutrition_advice: ['Protein sources?', 'Meal ideas?', 'Healthy snacks?'],
    calorie_query: ['Daily goal?', 'Meal breakdown?', 'Adjust target'],
    progress_check: ['Weekly summary', 'Set new goal', 'Compare trends'],
    food_analysis: ['Another meal', 'Healthier options?', 'Portion size'],
    unknown: ['Create workout', 'Analyze food', 'Health tips']
};

// Context-specific suggestions based on last query
const CONTEXTUAL_SUGGESTIONS: Record<string, string[]> = {
    water: ['How much sleep?', 'Best workout time?', 'Rest days?'],
    rest: ['Sleep quality tips?', 'Recovery meals?', 'Stretching routine?'],
    workout_timing: ['Morning routine?', 'Pre-workout meal?', 'Post-workout tips?'],
    tired: ['Energy boost tips?', 'Better sleep?', 'Stress relief?'],
    give_up: ['Quick wins?', 'Celebrate progress?', 'Find motivation?']
};

export function QuickReplies({ intent, lastQuery, onReplyClick }: QuickRepliesProps) {
    // Try to find contextual suggestions first
    let suggestions = REPLY_SUGGESTIONS[intent] || REPLY_SUGGESTIONS.unknown;

    // Check for context-specific overrides
    if (lastQuery) {
        const lowerQuery = lastQuery.toLowerCase();
        for (const [key, contextSuggestions] of Object.entries(CONTEXTUAL_SUGGESTIONS)) {
            if (lowerQuery.includes(key)) {
                suggestions = contextSuggestions;
                break;
            }
        }
    }

    return (
        <div className={styles.quickReplies}>
            {suggestions.map((suggestion) => (
                <button
                    key={suggestion}
                    className={styles.replyChip}
                    onClick={() => onReplyClick(suggestion)}
                >
                    {suggestion}
                </button>
            ))}
        </div>
    );
}
