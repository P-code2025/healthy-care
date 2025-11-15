// src/pages/onboarding/steps/StepName.tsx
import { useState } from "react";
import styles from "../OnboardingStep.module.css";
// import badgeIcon from "../../../assets/icons/badge.svg";

interface Props {
  data: any;
  onNext: (data: any) => void;
  onPrev?: () => void;
}

export default function StepName({ onNext, onPrev }: Props) {
  const [name, setName] = useState("");

  return (
    <div className={styles.step}>
      {/* <img src={badgeIcon} alt="Name" className={styles.icon} /> */}
      <h1>What is your name?</h1>

      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={styles.input}
        autoFocus
      />

      <button
        onClick={() => onNext({ name })}
        disabled={!name.trim()}
        className={styles.nextBtn}
      >
        Next
      </button>
    </div>
  );
}
