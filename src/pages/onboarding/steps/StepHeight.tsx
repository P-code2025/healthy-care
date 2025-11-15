// src/pages/onboarding/steps/StepHeight.tsx
import { useState } from "react";
import styles from "../OnboardingStep.module.css";
// import heightIcon from "../../../assets/icons/height.svg";

interface Props {
  data: any;
  onNext: (data: any) => void;
  onPrev?: () => void;
}

export default function StepHeight({ onNext, onPrev }: Props) {
  const [height, setHeight] = useState("");

  const handleNext = () => {
    const num = parseInt(height);
    if (num >= 100 && num <= 250) {
      onNext({ height: num });
    }
  };

  return (
    <div className={styles.step}>
      {/* <img src={heightIcon} alt="Chiều cao" className={styles.icon} /> */}
      <h1>Chiều cao của bạn?</h1>

      <div className={styles.inputWrapper}>
        <input
          type="number"
          placeholder="cm"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          className={styles.input}
          autoFocus
        />
        <span className={styles.unit}>cm</span>
      </div>

      <button
        onClick={handleNext}
        disabled={!height || parseInt(height) < 100 || parseInt(height) > 250}
        className={styles.nextBtn}
      >
        Tiếp theo
      </button>
    </div>
  );
}