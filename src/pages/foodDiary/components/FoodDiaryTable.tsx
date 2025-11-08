import type { FoodLog } from "../../../services/api";
import styles from "../FoodDiary.module.css";

export default function FoodDiaryTable({ logs }: { logs: FoodLog[] }) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Date</th>
          <th>Meal</th>
          <th>Food Name</th>
          <th>Calories</th>
          <th>Carbs (g)</th>
          <th>Protein (g)</th>
          <th>Fat (g)</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log) => (
          <tr key={log.log_id}>
            <td>{new Date(log.eaten_at).toLocaleDateString()}</td>
            <td>{log.meal_type}</td>
            <td>{log.food_name}</td>
            <td>{log.calories}</td>
            <td>{log.carbs_g}</td>
            <td>{log.protein_g}</td>
            <td>{log.fat_g}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
