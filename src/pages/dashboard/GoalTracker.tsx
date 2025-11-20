import styles from './GoalTracker.module.css';

interface Goal {
    id: string;
    label: string;
    current: number;
    target: number;
    unit: string;
    icon: string;
    color: string;
    bgColor: string;
}

interface Props {
    goals: Goal[];
}

export default function GoalTracker({ goals }: Props) {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Daily Goals</h3>
            </div>

            <div className={styles.goalList}>
                {goals.map((goal) => {
                    const percentage = Math.min((goal.current / goal.target) * 100, 100);
                    const isCompleted = percentage >= 100;

                    return (
                        <div key={goal.id} className={styles.goalItem}>
                            <div
                                className={`${styles.iconWrapper} ${isCompleted ? styles.celebration : ''}`}
                                style={{ background: goal.bgColor }}
                            >
                                {goal.icon}
                            </div>

                            <div className={styles.content}>
                                <div className={styles.labelRow}>
                                    <span className={styles.label}>{goal.label}</span>
                                    <span className={styles.value}>
                                        {goal.current} / {goal.target} {goal.unit}
                                    </span>
                                </div>

                                <div className={styles.progressBar}>
                                    <div
                                        className={styles.progressFill}
                                        style={{
                                            width: `${percentage}%`,
                                            background: goal.color
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
