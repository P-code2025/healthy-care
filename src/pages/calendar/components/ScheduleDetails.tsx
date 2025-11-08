// src/pages/calendar/components/ScheduleDetails.tsx

import styles from "../CalendarPage.module.css";
import type { FoodLog, WorkoutLog, AiSuggestion } from "../../../services/api";

// "Event" là kiểu dữ liệu chung mà CalendarPage.tsx tạo ra
type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
  resource: any; // Dữ liệu gốc
};

// Component hiển thị chi tiết (Sidebar phải)
export default function ScheduleDetails({ event }: { event: CalendarEvent }) {
  const { resource } = event;

  // Hiển thị chi tiết dựa trên loại sự kiện
  const renderDetails = () => {
    switch (resource.type) {
      case "food":
        const foodLog = resource.data as FoodLog;
        return (
          <>
            <p>
              <strong>Món ăn:</strong> {foodLog.food_name}
            </p>
            <p>
              <strong>Loại bữa:</strong> {foodLog.meal_type}
            </p>
            <p>
              <strong>Calories:</strong> {foodLog.calories} kcal
            </p>
            <p>
              <strong>Protein:</strong> {foodLog.protein_g} g
            </p>
            <p>
              <strong>Ghi chú:</strong> {foodLog.health_consideration}
            </p>
          </>
        );
      case "workout":
        const workoutLog = resource.data as WorkoutLog;
        return (
          <>
            <p>
              <strong>Bài tập:</strong> {workoutLog.exercise_name}
            </p>
            <p>
              <strong>Thời lượng:</strong> {workoutLog.duration_minutes} phút
            </p>
            <p>
              <strong>Calo đốt cháy:</strong>{" "}
              {workoutLog.calories_burned_estimated} kcal
            </p>
            <p>
              <strong>Trạng thái:</strong> Đã hoàn thành
            </p>
          </>
        );
      case "suggestion":
        const suggestion = resource.data as AiSuggestion;
        return (
          <>
            <p>
              <strong>Loại gợi ý:</strong> {suggestion.type}
            </p>
            <p>
              <strong>Chi tiết:</strong>
            </p>
            {/* Hiển thị JSON của ai_suggestions */}
            <pre style={{ fontSize: 12, background: "#f5f5f5", padding: 8 }}>
              {JSON.stringify(suggestion.content_details, null, 2)}
            </pre>
          </>
        );
      default:
        return <p>Không có chi tiết.</p>;
    }
  };

  return (
    <div className={styles.detailsSidebar}>
      <h3 className={styles.detailsTitle}>{event.title}</h3>
      <div className={styles.detailsContent}>
        <p>
          <strong>Thời gian:</strong> {event.start.toLocaleString()}
        </p>
        {renderDetails()}
      </div>
    </div>
  );
}
