// src/pages/Progress/components/WeeklyProgressTable.tsx
import styles from "../Progress.module.css";
import type { User } from "../../../services/api";

export default function WeeklyProgressTable({ user }: { user: User }) {
  // Mock dữ liệu theo tuần, hiện tại chỉ có weight_kg
  const weeks = [
    { week: "Week 1", weight: user.weight_kg },
    { week: "Week 2", weight: user.weight_kg - 0.5 },
    { week: "Week 3", weight: user.weight_kg - 1 },
    { week: "Week 4", weight: user.weight_kg - 1.5 },
  ];

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>Weekly Progress</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Week</th>
            <th>Weight (kg)</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((w) => (
            <tr key={w.week}>
              <td>{w.week}</td>
              <td>{w.weight}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
