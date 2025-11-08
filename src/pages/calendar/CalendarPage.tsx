// src/pages/calendar/CalendarPage.tsx

import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import type { View } from "react-big-calendar";
import { format } from "date-fns/format";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
import { vi } from "date-fns/locale/vi";
import styles from "./CalendarPage.module.css";

import { api } from "../../services/api";
import type { FoodLog, WorkoutLog, AiSuggestion } from "../../services/api";
import ScheduleDetails from "./components/ScheduleDetails"; // Import component mới

// Cài đặt ngôn ngữ và ngày bắt đầu tuần (Thứ 2)
const locales = { vi: vi };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// Định dạng "Event" mà thư viện lịch yêu cầu
interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: any; // Dữ liệu gốc
}

// Component KPI Card (tạo bên trong cho tiện)
function KpiCard({ title, value }: { title: string; value: number }) {
  return (
    <div className={styles.kpiCard}>
      <h4>{title}</h4>
      <p>{value} agendas</p>
    </div>
  );
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );

  // State cho các thẻ KPI
  const [mealCount, setMealCount] = useState(0);
  const [activityCount, setActivityCount] = useState(0);

  // State cho view (Month/Week/Day)
  const [view, setView] = useState<View>("month");

  useEffect(() => {
    Promise.all([
      api.getFoodLog(),
      api.getWorkoutLog(),
      api.getAiSuggestions(),
    ]).then(
      ([foodLogs, workoutLogs, aiSuggestions]: [
        FoodLog[],
        WorkoutLog[],
        AiSuggestion[]
      ]) => {
        // Chuyển đổi food_log
        const foodEvents: CalendarEvent[] = foodLogs.map((log: FoodLog) => ({
          title: `(Ăn) ${log.food_name}`,
          start: new Date(log.eaten_at),
          end: new Date(log.eaten_at),
          allDay: false,
          resource: { type: "food", data: log }, // Gắn data gốc vào resource
        }));

        // Chuyển đổi workout_log
        const workoutEvents: CalendarEvent[] = workoutLogs.map(
          (log: WorkoutLog) => ({
            title: `(Tập) ${log.exercise_name}`,
            start: new Date(log.completed_at),
            end: new Date(
              new Date(log.completed_at).getTime() +
                log.duration_minutes * 60000
            ),
            allDay: false,
            resource: { type: "workout", data: log }, // Gắn data gốc
          })
        );

        // Chuyển đổi ai_suggestions
        const suggestionEvents: CalendarEvent[] = aiSuggestions.map(
          (s: AiSuggestion) => ({
            title: `(Gợi ý) ${s.type}`,
            start: new Date(s.generated_at),
            end: new Date(s.generated_at),
            allDay: true,
            resource: { type: "suggestion", data: s }, // Gắn data gốc
          })
        );

        setEvents([...foodEvents, ...workoutEvents, ...suggestionEvents]);

        // Tính toán KPI (chỉ dùng data từ db.json)
        const nutritionSuggestions = aiSuggestions.filter(
          (s) => s.type === "nutrition"
        ).length;
        setMealCount(foodLogs.length + nutritionSuggestions);

        const workoutSuggestions = aiSuggestions.filter(
          (s) => s.type === "workout"
        ).length;
        setActivityCount(workoutLogs.length + workoutSuggestions);
      }
    );
  }, []);

  return (
    <div>
      <h2 className={styles.title}>Calendar</h2>

      {/* 1. CÁC THẺ KPI */}
      <div className={styles.kpiContainer}>
        <KpiCard title="Total Meal Planning Schedule" value={mealCount} />
        <KpiCard
          title="Total Physical Activities Schedule"
          value={activityCount}
        />
        {/* Chúng ta không có data cho "Appointments" nên ẩn đi */}
        {/* <KpiCard title="Total Appointments/Events Schedule" value={0} /> */}
      </div>

      {/* 2. LAYOUT LỊCH VÀ SIDEBAR CHI TIẾT */}
      <div className={styles.calendarLayout}>
        {/* Cột Lịch (bên trái) */}
        <div className={styles.calendarWrapper}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            culture="vi"
            view={view} // Kiểm soát view (tháng/tuần/ngày)
            onView={(v) => setView(v)} // Cho phép đổi view
            onSelectEvent={(event) => setSelectedEvent(event)} // Khi click vào sự kiện
          />
        </div>

        {/* Cột Chi tiết (bên phải) */}
        {selectedEvent ? (
          <ScheduleDetails event={selectedEvent} />
        ) : (
          <div className={styles.detailsSidebar}>
            <p>Click on an event to see details.</p>
          </div>
        )}
      </div>
    </div>
  );
}
