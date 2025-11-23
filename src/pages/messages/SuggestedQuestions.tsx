import { useState } from 'react';
import styles from './SuggestedQuestions.module.css';

interface SuggestedQuestionsProps {
    onQuestionClick: (question: string) => void;
}

export function SuggestedQuestions({ onQuestionClick }: SuggestedQuestionsProps) {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    const categories = [
        {
            icon: '🏥',
            label: 'General Health',
            questions: [
                'How much water should I drink?',
                'When should I workout?',
                'How much rest do I need?'
            ]
        },
        {
            icon: '💪',
            label: 'Motivation',
            questions: [
                'I feel tired',
                'I want to give up',
                'How do I stay motivated?'
            ]
        },
        {
            icon: '🏋️',
            label: 'Workouts',
            questions: [
                'Create a workout plan',
                'Make it harder',
                'I have sore muscles'
            ]
        },
        {
            icon: '🍎',
            label: 'Nutrition',
            questions: [
                'What should I eat?',
                'Calories today?',
                'Protein sources?'
            ]
        }
    ];

    return (
        <div className={styles.suggestedQuestions}>
            <div className={styles.guideHeader}>
                <span className={styles.guideIcon}>🤖</span>
                <h3 className={styles.guideTitle}>AI Health Coach</h3>
            </div>
            <p className={styles.guideSubtitle}>
                Ask me about workouts, nutrition, motivation, or your health goals!
            </p>

            {categories.map((category) => (
                <div key={category.label} className={styles.categorySection}>
                    <div className={styles.categoryLabel}>
                        <span className={styles.categoryIcon}>{category.icon}</span>
                        {category.label}
                    </div>
                    <div className={styles.questionList}>
                        {category.questions.map((question) => (
                            <button
                                key={question}
                                className={styles.questionChip}
                                onClick={() => onQuestionClick(question)}
                            >
                                {question}
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            <button
                className={styles.dismissButton}
                onClick={() => setDismissed(true)}
            >
                Dismiss guide
            </button>
        </div>
    );
}
