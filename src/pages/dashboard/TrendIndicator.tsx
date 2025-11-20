import styles from './TrendIndicator.module.css';

interface Props {
    current: number;
    previous: number;
    inverse?: boolean; // If true, lower is better (e.g. weight loss)
}

export default function TrendIndicator({ current, previous, inverse = false }: Props) {
    if (!previous) return null;

    const percentage = ((current - previous) / previous) * 100;
    const isPositive = percentage > 0;
    const isNeutral = percentage === 0;

    // Determine color based on whether increase is good or bad
    // Default: Increase is good (green), Decrease is bad (red)
    // Inverse: Increase is bad (red), Decrease is good (green)
    let type = 'neutral';
    if (!isNeutral) {
        if (inverse) {
            type = isPositive ? 'down' : 'up'; // Red if up, Green if down
        } else {
            type = isPositive ? 'up' : 'down'; // Green if up, Red if down
        }
    }

    // Arrow always follows the math (Up if positive, Down if negative)
    const arrow = isPositive ? '↑' : '↓';

    return (
        <div className={`${styles.container} ${styles[type]}`}>
            <span className={styles.icon}>{!isNeutral && arrow}</span>
            <span>{Math.abs(percentage).toFixed(1)}%</span>
        </div>
    );
}
