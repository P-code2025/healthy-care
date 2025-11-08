import { useEffect, useState } from "react";
import { api } from "../../services/api";
import type { FoodLog, WorkoutLog } from "../../services/api";

import DashboardCard from "./DashboardCard";
import CaloriesCard from "./CaloriesCard";
import WorkoutProgressList from "./WorkoutProgressList";
import RecommendedMenuList from "./RecommendedMenuList";
import RecommendedExerciseList from "./RecommendedExerciseList";
import RecentActivity from "./RecentActivity";

export default function Dashboard() {
  const [foodLog, setFoodLog] = useState<FoodLog[]>([]);
  const [workoutLog, setWorkoutLog] = useState<WorkoutLog[]>([]);

  useEffect(() => {
    api.getFoodLog().then(setFoodLog).catch(console.error);
    api.getWorkoutLog().then(setWorkoutLog).catch(console.error);
  }, []);

  const totalCalories = foodLog.reduce((sum, f) => sum + f.calories, 0);
  const burned = workoutLog.reduce(
    (sum, w) => sum + (w.calories_burned_estimated || 0),
    0
  );
  const consumed = totalCalories;
  const goal = 2000;

  const workouts = [
    { name: "Running (1h)", value: 60 },
    { name: "Squatting (50kg)", value: 85 },
    { name: "Stretching (1h)", value: 40 },
  ];

  const menus = [
    { title: "Grilled Chicken Salad" },
    { title: "Oatmeal with Almond Butter" },
    { title: "Grilled Chicken Wrap" },
    { title: "Avocado and Spinach" },
  ];

  const exercises = [
    { title: "Brisk Walking" },
    { title: "Bodyweight Squats" },
    { title: "Stretching" },
  ];

  const recent = [
    {
      time: "12:30 PM",
      text: "Grilled Chicken Salad with Avocado and Spinach",
    },
    { time: "9:00 AM", text: "Oatmeal with Almond Butter" },
    { time: "7:30 AM", text: "Grilled Chicken Wrap" },
    { time: "6:00 AM", text: "Bodyweight Squats" },
    { time: "5:30 AM", text: "Brisk Walking" },
    { time: "5:00 AM", text: "Stretching" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
      {/* Khu vực chính bên trái */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 24,
        }}
      >
        <DashboardCard title="Steps" value={8690} unit="steps" />
        <DashboardCard title="Sleep" value={"7h 30m"} />
        <DashboardCard title="Water Intake" value={1.2} unit="L" />
        <DashboardCard title="Weight" value={"78 kg"} />

        <div style={{ gridColumn: "1 / -1" }}>
          <CaloriesCard
            total={consumed}
            goal={goal}
            burned={burned}
            consumed={consumed}
          />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <WorkoutProgressList items={workouts} />
        </div>

        <RecommendedMenuList items={menus} />
        <RecommendedExerciseList items={exercises} />
      </div>

      {/* Cột phải: Recent Activity */}
      <RecentActivity items={recent} />
    </div>
  );
}
