import styles from './ExerciseCard.module.css';

interface Props {
  title: string;
  calories: number;
  duration: number;
  difficulty: string;
  image: string;
}

export default function ExerciseCard({ title, calories, duration, difficulty }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.iconWrapper}>
        <span className={styles.icon}>🏃</span>
      </div>
      <div className={styles.content}>
        <h4 className={styles.title}>{title}</h4>
        <div className={styles.info}>
          <span className={styles.infoItem}>⚡ {calories} kcal</span>
          <span className={styles.infoItem}>⏱️ {duration} min</span>
        </div>
        <span className={`${styles.badge} ${styles[difficulty.toLowerCase()]}`}>
          {difficulty}
        </span>
      </div>
    </div>
  );
}
