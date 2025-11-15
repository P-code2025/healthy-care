// src/pages/onboarding/steps/StepWeight.tsx
import { useState } from "react";
import styles from "../OnboardingStep.module.css";
// import weightIcon from "../../../assets/icons/weight.svg";

interface Props {
  data: any;
  onNext: (data: any) => void;
  onPrev?: () => void;
}

export default function StepWeight({ onNext, onPrev }: Props) {
  const [weight, setWeight] = useState("");

  const handleNext = () => {
    const num = parseFloat(weight);
    if (num >= 30 && num <= 200) {
      onNext({ weight: num });
    }
  };

  return (
    <div className={styles.step}>
      {/* <img src={weightIcon} alt="Cân nặng" className={styles.icon} /> */}
      <h1>Bạn nặng bao nhiêu?</h1>

      <div className={styles.inputWrapper}>
        <input
          type="number"
          step="0.1"
          placeholder="kg"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className={styles.input}
          autoFocus
        />
        <span className={styles.unit}>kg</span>
      </div>

      <button
        onClick={handleNext}
        disabled={!weight || parseFloat(weight) < 30 || parseFloat(weight) > 200}
        className={styles.nextBtn}
      >
        Tiếp theo
      </button>
    </div>
  );
}