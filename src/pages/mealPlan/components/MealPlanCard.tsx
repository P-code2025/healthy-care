// src/pages/MealPlan/components/MealPlanCard.tsx
import type { AiSuggestion } from "../../../services/api";
import styles from "../MealPlan.module.css";

export default function MealPlanCard({
  suggestion,
}: {
  suggestion: AiSuggestion;
}) {
  const { meal_plan, notes } = suggestion.content_details;

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>
        Generated at {new Date(suggestion.generated_at).toLocaleString()}
      </h3>
      <ul>
        {meal_plan.map((meal: any, idx: number) => (
          <li key={idx}>
            <strong>{meal.meal}</strong> – {meal.calories} kcal
            <br />
            Items: {meal.items.join(", ")}
          </li>
        ))}
      </ul>
      {notes && <p className={styles.notes}>{notes}</p>}
    </div>
  );
}
