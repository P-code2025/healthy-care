// src/pages/Progress/components/CaloriesActivities.tsx
import {
  LineChart,
  Line,
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
  // Gom calories theo ngày
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
    intake: intakeByDate[d] || 0,
    burn: burnByDate[d] || 0,
  }));

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>Calories Intake vs Burn</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="intake"
            stroke="#8884d8"
            name="Calories Intake"
          />
          <Line
            type="monotone"
            dataKey="burn"
            stroke="#82ca9d"
            name="Calories Burned"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
