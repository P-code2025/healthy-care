// src/pages/Progress/components/AiSuggestions.tsx
import styles from "../Progress.module.css";
import type { AiSuggestion } from "../../../services/api";

export default function AiSuggestions({
  suggestions,
}: {
  suggestions: AiSuggestion[];
}) {
  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>AI Suggestions</h3>
      {suggestions.map((s) => (
        <div key={s.suggestion_id} className={styles.suggestion}>
          <p>
            <strong>Type:</strong> {s.type}
          </p>
          <p>
            <strong>Generated At:</strong>{" "}
            {new Date(s.generated_at).toLocaleString()}
          </p>
          {s.type === "nutrition" && (
            <div>
              <h4>Meal Plan</h4>
              <ul>
                {s.content_details.meal_plan.map((meal: any, idx: number) => (
                  <li key={idx}>
                    {meal.meal}: {meal.calories} kcal – {meal.items.join(", ")}
                  </li>
                ))}
              </ul>
              <p>
                <em>{s.content_details.notes}</em>
              </p>
            </div>
          )}
          {s.type === "workout" && (
            <div>
              <h4>Workout Routine</h4>
              <ul>
                {s.content_details.routine.map((r: any, idx: number) => (
                  <li key={idx}>
                    {r.name} – {r.duration_minutes} min
                  </li>
                ))}
              </ul>
              <p>Intensity: {s.content_details.intensity}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
