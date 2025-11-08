// src/pages/Progress/components/CaloriesActivities.tsx
import {
  BarChart, // Sửa: Import BarChart
  Bar, // Sửa: Import Bar
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { FoodLog, WorkoutLog } from "../../../services/api";
import styles from "../Progress.module.css";

export default function CaloriesActivities({
  foodLogs,
  workoutLogs,
}: {
  foodLogs: FoodLog[];
  workoutLogs: WorkoutLog[];
}) {
  // Gom calories theo ngày (Phần này code cũ của bạn đã làm đúng)
  const intakeByDate: Record<string, number> = {};
  foodLogs.forEach((f) => {
    const date = new Date(f.eaten_at).toLocaleDateString("vi-VN");
    intakeByDate[date] = (intakeByDate[date] || 0) + f.calories;
  });

  const burnByDate: Record<string, number> = {};
  workoutLogs.forEach((w) => {
    const date = new Date(w.completed_at).toLocaleDateString("vi-VN");
    burnByDate[date] = (burnByDate[date] || 0) + w.calories_burned_estimated;
  });

  const allDates = Array.from(
    new Set([...Object.keys(intakeByDate), ...Object.keys(burnByDate)])
  );

  const data = allDates.map((d) => ({
    date: d,
    Consumed: intakeByDate[d] || 0, // Đổi tên "intake" thành "Consumed"
    Burned: burnByDate[d] || 0, // Đổi tên "burn" thành "Burned"
  }));

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>Calories Intake vs Burn</h3>

      {/* Sửa: Dùng BarChart thay vì LineChart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Consumed" fill="#f87171" name="Calories Consumed" />
          <Bar dataKey="Burned" fill="#4ade80" name="Calories Burned" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
