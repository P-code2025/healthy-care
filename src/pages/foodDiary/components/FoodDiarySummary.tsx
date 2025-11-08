import type { FoodLog } from "../../../services/api";
import styles from "../FoodDiary.module.css";

export default function FoodDiarySummary({ logs }: { logs: FoodLog[] }) {
  const totalCalories = logs.reduce((sum, l) => sum + l.calories, 0);
  const totalCarbs = logs.reduce((sum, l) => sum + l.carbs_g, 0);
  const totalProtein = logs.reduce((sum, l) => sum + l.protein_g, 0);
  const totalFat = logs.reduce((sum, l) => sum + l.fat_g, 0);

  return (
    <div className={styles.summary}>
      <div className={styles.summaryItem}>
        <strong>Total Calories:</strong> {totalCalories} kcal
      </div>
      <div className={styles.summaryItem}>
        <strong>Total Carbs:</strong> {totalCarbs} g
      </div>
      <div className={styles.summaryItem}>
        <strong>Total Protein:</strong> {totalProtein} g
      </div>
      <div className={styles.summaryItem}>
        <strong>Total Fat:</strong> {totalFat} g
      </div>
    </div>
  );
}
