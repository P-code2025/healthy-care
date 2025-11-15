// src/pages/onboarding/steps/StepGoal.tsx
import { useState } from "react";
import styles from "../OnboardingStep.module.css";
import targetIcon from "../../../assets/icons/target.svg";

interface Props {
  data: any;
  onNext: (data: any) => void;
  onPrev?: () => void;
}

export default function StepGoal({ onNext, onPrev }: Props) {
  const [goalWeight, setGoalWeight] = useState("");

  const handleNext = () => {
    const num = parseFloat(goalWeight);
    if (num >= 30 && num <= 200) {
      onNext({ goalWeight: num });
    }
  };

  return (
    <div className={styles.step}>
      <img src={targetIcon} alt="Goal" className={styles.icon} />
      <h1>What is your target weight?</h1>

      <div className={styles.inputWrapper}>
        <input
          type="number"
          step="0.1"
          placeholder="kg"
          value={goalWeight}
          onChange={(e) => setGoalWeight(e.target.value)}
          className={styles.input}
          autoFocus
        />
        <span className={styles.unit}>kg</span>
      </div>

      <button
        onClick={handleNext}
        disabled={!goalWeight || parseFloat(goalWeight) < 30 || parseFloat(goalWeight) > 200}
        className={styles.nextBtn}
      >
        Next
      </button>
    </div>
  );
}
