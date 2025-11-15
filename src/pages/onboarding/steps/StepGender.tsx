// src/pages/onboarding/steps/StepGender.tsx
import styles from "../OnboardingStep.module.css";
import genderIcon from "../../../assets/icons/gender.svg";

interface Props {
  data: any;
  onNext: (data: any) => void;
  onPrev?: () => void;
}

export default function StepGender({ onNext, onPrev }: Props) {
  return (
    <div className={styles.step}>
      <img src={genderIcon} alt="Gender" className={styles.icon} />
      <h1>What is your gender?</h1>

      <div className={styles.buttonGroup}>
        <button
          onClick={() => onNext({ gender: "Nam" })}
          className={styles.genderBtn}
        >
          Male
        </button>
        <button
          onClick={() => onNext({ gender: "Nữ" })}
          className={styles.genderBtn}
        >
          Female
        </button>
      </div>
    </div>
  );
}
