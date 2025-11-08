import { useEffect, useState } from "react";
import { api } from "../../services/api";
import type { FoodLog } from "../../services/api"; // dùng interface từ api.ts
import styles from "./FoodDiary.module.css";

export default function FoodDiary() {
  const [logs, setLogs] = useState<FoodLog[]>([]);

  useEffect(() => {
    api
      .getFoodLog()
      .then((data) => {
        console.log("Food log data:", data); // debug
        setLogs(data);
      })
      .catch((err) => console.error("API error:", err));
  }, []);
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Food Diary</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Meal Type</th>
            <th>Food Name</th>
            <th>Calories</th>
            <th>Protein (g)</th>
            <th>Carbs (g)</th>
            <th>Fat (g)</th>
            <th>Eaten At</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.log_id}>
              <td>{log.meal_type}</td>
              <td>{log.food_name}</td>
              <td>{log.calories}</td>
              <td>{log.protein_g}</td>
              <td>{log.carbs_g}</td>
              <td>{log.fat_g}</td>
              <td>{new Date(log.eaten_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
