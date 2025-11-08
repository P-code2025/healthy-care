// src/pages/exercises/Exercises.tsx

import { useEffect, useState } from "react";
import { api } from "../../services/api";
import type { WorkoutLog, AiSuggestion } from "../../services/api";
import styles from "./Exercises.module.css";

// Tạo một kiểu dữ liệu chung để hợp nhất data
interface UnifiedExercise {
  id: string;
  name: string;
  duration: number | null;
  calories: number | null;
  status: "Completed" | "Pending" | "Applied";
}

// Component Tag Trạng thái
function StatusTag({ status }: { status: UnifiedExercise["status"] }) {
  let styleKey: string;
  switch (status) {
    case "Completed":
      styleKey = styles.completed;
      break;
    case "Applied":
      styleKey = styles.inProgress; // Coi "Applied" như "In Progress"
      break;
    default:
      styleKey = styles.notStarted; // Coi "Pending" như "Not Started"
  }
  return <span className={`${styles.statusTag} ${styleKey}`}>{status}</span>;
}

// Trang chính
export default function Exercises() {
  const [combinedList, setCombinedList] = useState<UnifiedExercise[]>([]);

  useEffect(() => {
    // 1. Fetch cả hai nguồn dữ liệu
    // Dòng code đã sửa
    Promise.all([api.getWorkoutLog(), api.getAiSuggestions()]).then(
      ([completedLogs, suggestedWorkouts]: [WorkoutLog[], AiSuggestion[]]) => {
        // 2. Chuyển đổi workout_log (đã hoàn thành)
        const completed: UnifiedExercise[] = completedLogs.map((log) => ({
          id: `comp-${log.log_id}`,
          name: log.exercise_name,
          duration: log.duration_minutes,
          calories: log.calories_burned_estimated,
          status: "Completed",
        }));

        // 3. Chuyển đổi ai_suggestions (được gợi ý)
        const suggested: UnifiedExercise[] = suggestedWorkouts
          .filter((s) => s.type === "workout")
          .flatMap(
            (
              s // Dùng flatMap để duyệt qua mảng routine bên trong
            ) =>
              s.content_details.routine.map((r: any) => ({
                id: `sugg-${s.suggestion_id}-${r.name}`,
                name: r.name,
                duration: r.duration_minutes,
                calories: null, // AI suggestion không có calo ước tính
                status: s.is_applied ? "Applied" : "Pending",
              }))
          );

        // 4. Hợp nhất
        setCombinedList([...suggested, ...completed]);
      }
    );
  }, []);

  return (
    <div className={styles.container}>
      {/* TASK 1: HIỂN THỊ THANH ĐIỀU KHIỂN (GIỐNG UI)
       */}
      <div className={styles.controls}>
        <input
          type="text"
          placeholder="Search for exercise"
          className={styles.search}
        />
        <select className={styles.filterBtn}>
          <option>Status</option>
        </select>
        <select className={styles.selectWeek}>
          <option>This Week</option>
        </select>
        <button className={styles.addBtn}>+ Add Exercise</button>
      </div>

      {/* TASK 2: HIỂN THỊ BẢNG (GIỐNG UI - CHỈ CÓ CÁC CỘT CÓ DATA)
       */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Exercise Name</th>
            <th>Duration (min)</th>
            {/* Các cột Sets, Reps, Rest, Weight bị ẩn 
              vì db.json không có dữ liệu này.
            */}
            <th>Calories</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {combinedList.map((ex) => (
            <tr key={ex.id}>
              <td>{ex.name}</td>
              <td>{ex.duration || "N/A"}</td>
              <td>{ex.calories || "N/A"}</td>
              <td>
                <StatusTag status={ex.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
