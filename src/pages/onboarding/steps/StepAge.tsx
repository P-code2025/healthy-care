// src/pages/onboarding/steps/StepAge.tsx
import { useState } from "react";
import styles from "../OnboardingStep.module.css";
import cakeIcon from "../../../assets/icons/cake.svg";

interface Props {
  data: any;
  onNext: (data: any) => void;
  onPrev?: () => void;
}

export default function StepAge({ onNext, onPrev }: Props) {
  const [age, setAge] = useState("");

  const handleNext = () => {
    const num = parseInt(age);
    if (num >= 10 && num <= 100) {
      onNext({ age: num });
    }
  };

  return (
    <div className={styles.step}>
      <img src={cakeIcon} alt="Age" className={styles.icon} />
      <h1>How old are you?</h1>

      <div className={styles.inputWrapper}>
        <input
          type="number"
          placeholder="Enter your age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className={styles.input}
          min="10"
          max="100"
          autoFocus
        />
        <span className={styles.unit}>years</span>
      </div>

      <button
        onClick={handleNext}
        disabled={!age || parseInt(age) < 10 || parseInt(age) > 100}
        className={styles.nextBtn}
      >
        Next
      </button>
    </div>
  );
}
