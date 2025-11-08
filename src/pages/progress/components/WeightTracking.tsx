// src/pages/Progress/components/WeightTracking.tsx
import type { User } from "../../../services/api";
import styles from "../Progress.module.css";

export default function WeightTracking({ user }: { user: User }) {
  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>Weight Tracking</h3>
      <p>
        <strong>Current Weight:</strong> {user.weight_kg} kg
      </p>
      <p>
        <strong>Height:</strong> {user.height_cm} cm
      </p>
      <p>
        <strong>Goal:</strong> {user.goal}
      </p>
      <p>
        <strong>Activity Level:</strong> {user.activity_level}
      </p>
    </div>
  );
}
