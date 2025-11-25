// Quick Action Buttons Component
import { Copy, RotateCcw, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import styles from './QuickActions.module.css';

interface QuickActionsProps {
    messageId: string;
    content: string;
    onRegenerate?: () => void;
}

export function QuickActions({ messageId, content, onRegenerate }: QuickActionsProps) {
    const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null);

    const handleCopy = async () => {
        try {
            // Remove markdown formatting for cleaner copy
            const cleanContent = content.replace(/\*\*(.*?)\*\*/g, '$1');
            await navigator.clipboard.writeText(cleanContent);
            toast.success('Copied to clipboard!');
        } catch (error) {
            toast.error('Failed to copy');
        }
    };

    const handleFeedback = (helpful: boolean) => {
        const newFeedback = helpful ? 'helpful' : 'not-helpful';
        setFeedback(newFeedback);

        // Store feedback in localStorage
        const feedbackData = JSON.parse(localStorage.getItem('aiFeedback') || '{}');
        feedbackData[messageId] = { helpful, timestamp: new Date().toISOString() };
        localStorage.setItem('aiFeedback', JSON.stringify(feedbackData));

        toast.success(helpful ? 'Thanks for your feedback! 👍' : 'Thanks! We\'ll improve. 💪');
    };

    return (
        <div className={styles.actions}>
            <button
                className={styles.actionBtn}
                onClick={handleCopy}
                title="Copy to clipboard"
            >
                <Copy size={14} />
            </button>

            {onRegenerate && (
                <button
                    className={styles.actionBtn}
                    onClick={onRegenerate}
                    title="Regenerate response"
                >
                    <RotateCcw size={14} />
                </button>
            )}

            <div className={styles.feedbackGroup}>
                <button
                    className={`${styles.actionBtn} ${feedback === 'helpful' ? styles.active : ''}`}
                    onClick={() => handleFeedback(true)}
                    title="Helpful"
                >
                    <ThumbsUp size={14} />
                </button>
                <button
                    className={`${styles.actionBtn} ${feedback === 'not-helpful' ? styles.active : ''}`}
                    onClick={() => handleFeedback(false)}
                    title="Not helpful"
                >
                    <ThumbsDown size={14} />
                </button>
            </div>
        </div>
    );
}
