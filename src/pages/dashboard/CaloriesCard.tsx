import styles from "./CaloriesCard.module.css";

interface Props {
  total: number;
  goal: number;
  burned: number;
  consumed: number;
}

export default function CaloriesCard({ total, goal, burned, consumed }: Props) {
  return (
    <div className={styles.card}>
      <h4 className={styles.title}>Calories Intake</h4>
      <p className={styles.total}>{total} Kcal</p>
      <div className={styles.breakdown}>
        <div>
          <strong>Goal:</strong> {goal} Kcal
        </div>
        <div>
          <strong>Burned:</strong> {burned} Kcal
        </div>
        <div>
          <strong>Consumed:</strong> {consumed} Kcal
        </div>
      </div>
    </div>
  );
}
