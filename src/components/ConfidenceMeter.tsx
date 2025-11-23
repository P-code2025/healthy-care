import styles from './ConfidenceMeter.module.css';

interface ConfidenceMeterProps {
    value: number;
    showPercentage?: boolean;
    size?: 'small' | 'medium' | 'large';
}

export function ConfidenceMeter({
    value,
    showPercentage = true,
    size = 'medium'
}: ConfidenceMeterProps) {
    const percentage = Math.round(value * 100);

    const getConfidenceLevel = () => {
        if (value >= 0.8) return 'high';
        if (value >= 0.6) return 'medium';
        return 'low';
    };

    const level = getConfidenceLevel();

    return (
        <div className={`${styles.confidenceMeter} ${styles[size]}`}>
            <div className={styles.label}>
                <span className={styles.labelText}>Confidence</span>
                {showPercentage && (
                    <span className={`${styles.percentage} ${styles[level]}`}>
                        {percentage}%
                    </span>
                )}
            </div>
            <div className={styles.barContainer}>
                <div
                    className={`${styles.bar} ${styles[level]}`}
                    style={{ width: `${percentage}%` }}
                >
                    <div className={styles.barShine} />
                </div>
            </div>
            <div className={styles.levelIndicator}>
                {level === 'high' && '✅ High confidence'}
                {level === 'medium' && '⚠️ Medium confidence'}
                {level === 'low' && '❌ Low confidence - please verify'}
            </div>
        </div>
    );
}

export function ConfidenceBadge({ value }: { value: number }) {
    const percentage = Math.round(value * 100);
    const level = value >= 0.8 ? 'high' : value >= 0.6 ? 'medium' : 'low';

    return (
        <span className={`${styles.badge} ${styles[level]}`}>
            {percentage}% confidence
        </span>
    );
}
