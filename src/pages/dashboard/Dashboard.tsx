import { useEffect, useState } from "react";
import { api } from "../../services/api";
import type { FoodLog } from "../../services/api";

import StatsCard from "./StatsCard";
import CaloriesCard from "./CaloriesCard";
import WorkoutCard from "./WorkoutCard";
import MenuCard from "./MenuCard";
import ExerciseCard from "./ExerciseCard";
import RecentActivity from "./RecentActivity";
import WeightGauge from "./WeightGauge";
import WeeklyActivityChart from "./WeeklyActivityChart";
import CalendarWidget from "./CalendarWidget";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const [foodLog, setFoodLog] = useState<FoodLog[]>([]);

  useEffect(() => {
    api.getFoodLog().then(setFoodLog).catch(console.error);
  }, []);

  const totalCalories = foodLog.reduce((sum, f) => sum + f.calories, 0);
  const consumed = totalCalories;
  const goal = 2000;

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
    <div className={styles.container}>
      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <StatsCard 
            title="Weight" 
            value={78} 
            unit="kg" 
            icon="⚖️"
            subtitle="85 kg left"
          />
          <StatsCard 
            title="Steps" 
            value={8050} 
            unit="steps" 
            icon="👟"
            subtitle="9500 steps left"
          />
          <StatsCard 
            title="Sleep" 
            value={6.5} 
            unit="hours" 
            icon="😴"
          />
          <StatsCard 
            title="Water Intake" 
            value={0.7} 
            unit="litre left" 
            icon="💧"
          />
        </div>

        {/* Weight Gauge and Calories */}
        <div className={styles.chartsRow}>
          <WeightGauge current={78} min={65} max={85} />
          <CaloriesCard
            total={consumed}
            goal={goal}
            consumed={consumed}
          />
        </div>

        {/* Weekly Activity Chart */}
        <WeeklyActivityChart />

        {/* Workout Progress Cards */}
        <div className={styles.workoutCards}>
          <WorkoutCard 
            icon="🏃"
            title="Running 10 km"
            percentage={75}
            status="Cardio"
            color="green"
          />
          <WorkoutCard 
            icon="🏋️"
            title="Squatting 50kg"
            percentage={100}
            status="Strength"
            color="orange"
          />
          <WorkoutCard 
            icon="🧘"
            title="Stretching to touch toes"
            percentage={50}
            status="Flexibility"
            color="coral"
          />
        </div>

        {/* Recommended Menus and Exercises */}
        <div className={styles.recommendedRow}>
          <div className={styles.menuSection}>
            <h3 className={styles.sectionTitle}>Recommended Menu</h3>
            <div className={styles.menuGrid}>
              <MenuCard 
                title="Oatmeal with Almond Butter and Berries"
                calories={350}
                category="Breakfast"
                image="https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400&h=300&fit=crop"
                carbs={45}
                protein={12}
                fats={8}
              />
              <MenuCard 
                title="Grilled Chicken Wrap with Avocado and Veggies"
                calories={450}
                category="Lunch"
                image="https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop"
                carbs={35}
                protein={30}
                fats={15}
              />
            </div>
          </div>

          <div className={styles.menuSection}>
            <h3 className={styles.sectionTitle}>Recommended Exercises</h3>
            <div className={styles.exerciseList}>
              <ExerciseCard 
                title="Brisk Walking"
                calories={200}
                duration={30}
                difficulty="Beginner"
                image=""
              />
              <ExerciseCard 
                title="Bodyweight Squats"
                calories={250}
                duration={20}
                difficulty="Intermediate"
                image=""
              />
              <ExerciseCard 
                title="Dumbbell Squat"
                calories={300}
                duration={30}
                difficulty="Hard"
                image=""
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className={styles.sidebar}>
        <CalendarWidget />
        <RecentActivity items={recent} />
      </div>
    </div>
  );
}
