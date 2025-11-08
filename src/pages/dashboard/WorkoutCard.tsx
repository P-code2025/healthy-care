import styles from './WorkoutCard.module.css';

interface Props {
  icon: string;
  title: string;
  percentage: number;
  status: string;
  color: 'green' | 'orange' | 'coral';
}

export default function WorkoutCard({ icon, title, percentage, status, color }: Props) {
  return (
    <div className={`${styles.card} ${styles[color]}`}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          {icon}
        </div>
        <span className={styles.status}>{status}</span>
      </div>
      <div className={styles.content}>
        <h4 className={styles.title}>{title}</h4>
        <span className={styles.percentage}>{percentage}%</span>
      </div>
      <div className={styles.progressBar}>
        <div className={styles.progress} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
