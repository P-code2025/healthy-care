import styles from './AILoadingState.module.css';

export type AILoadingType = 'exercise' | 'meal' | 'chat' | 'recognition';

interface AILoadingStateProps {
    type: AILoadingType;
    message?: string;
}

const DEFAULT_MESSAGES: Record<AILoadingType, string> = {
    exercise: '🏋️ Creating your personalized workout plan...',
    meal: '🍽️ Generating meal plan based on your goals...',
    chat: '🤖 AI is thinking...',
    recognition: '🔍 Analyzing your food image...'
};

export function AILoadingState({ type, message }: AILoadingStateProps) {
    const displayMessage = message || DEFAULT_MESSAGES[type];

    return (
        <div className={styles.aiLoading}>
            <div className={styles.spinnerContainer}>
                <div className={styles.spinner} />
            </div>
            <div className={styles.loadingText}>
                {displayMessage}
            </div>
            <div className={styles.progressContainer}>
                <div className={styles.progressBar} />
            </div>
            <p className={styles.hint}>
                This usually takes 5-10 seconds
            </p>
        </div>
    );
}

export function AILoadingInline({ type }: { type: AILoadingType }) {
    return (
        <div className={styles.aiLoadingInline}>
            <div className={styles.spinnerSmall} />
            <span>{DEFAULT_MESSAGES[type]}</span>
        </div>
    );
}
