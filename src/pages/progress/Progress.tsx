import { useEffect, useState } from "react";
import { api } from "../../services/api";
import type {
  User,
  FoodLog,
  WorkoutLog,
  AiSuggestion,
} from "../../services/api";
import styles from "./Progress.module.css";

import WeightTracking from "./components/WeightTracking";
import CaloriesActivities from "./components/CaloriesActivities";
import WeeklyProgressTable from "./components/WeeklyProgressTable";
import AiSuggestions from "./components/AiSuggestions";

export default function Progress() {
  const [user, setUser] = useState<User | null>(null);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);

  useEffect(() => {
    api.getUsers().then((users) => setUser(users[0]));
    api.getFoodLog().then(setFoodLogs);
    api.getWorkoutLog().then(setWorkoutLogs);
    api.getAiSuggestions().then(setSuggestions);
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Progress Tracking</h2>
      <div className={styles.grid}>
        <WeightTracking user={user} />
        <CaloriesActivities foodLogs={foodLogs} workoutLogs={workoutLogs} />
        <WeeklyProgressTable user={user} />
        <AiSuggestions suggestions={suggestions} />
      </div>
    </div>
  );
}
