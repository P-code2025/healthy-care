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
      {/* <img src={badgeIcon} alt="Tên" className={styles.icon} /> */}
      <h1>Tên của bạn là gì?</h1>

      <input
        type="text"
        placeholder="Nhập tên của bạn"
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
        Tiếp theo
      </button>
    </div>
  );
}