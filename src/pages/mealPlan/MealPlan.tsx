// src/pages/MealPlan/MealPlan.tsx
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import type { AiSuggestion } from "../../services/api";
import MealPlanCard from "./components/MealPlanCard";
import styles from "./MealPlan.module.css";

export default function MealPlan() {
  const [plans, setPlans] = useState<AiSuggestion[]>([]);

  useEffect(() => {
    api.getAiSuggestions().then((data) => {
      setPlans(data.filter((s) => s.type === "nutrition"));
    });
  }, []);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Meal Plan</h2>
      {plans.map((p) => (
        <MealPlanCard key={p.suggestion_id} suggestion={p} />
      ))}
    </div>
  );
}
