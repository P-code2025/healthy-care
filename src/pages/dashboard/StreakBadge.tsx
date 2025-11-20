import styles from './StreakBadge.module.css';

interface Props {
    streak: number;
}

export default function StreakBadge({ streak }: Props) {
    if (streak === 0) return null;

    return (
        <div className={styles.badge} title="Current Streak">
            <span className={styles.icon}>🔥</span>
            <span className={styles.count}>{streak}</span>
            <span className={styles.label}>Day Streak</span>
        </div>
    );
}
