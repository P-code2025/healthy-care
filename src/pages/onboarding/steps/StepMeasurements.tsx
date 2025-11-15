// src/pages/onboarding/steps/StepMeasurements.tsx
import { useState } from "react";
import styles from "../OnboardingStep.module.css";
// import measureIcon from "../../../assets/icons/measure.svg";

interface Props {
  data: any;
  onNext: (data: any) => void;
  onPrev?: () => void;
}

export default function StepMeasurements({ data, onNext, onPrev }: Props) {
  const [measurements, setMeasurements] = useState({
    neck: data.neck || "",
    waist: data.waist || "",
    hip: data.hip || "",
    biceps: data.biceps || "",
    thigh: data.thigh || "",
  });

  const handleChange = (field: string, value: string) => {
    setMeasurements((prev) => ({ ...prev, [field]: value }));
  };

  const allFilled = Object.values(measurements).every((v) => v && parseFloat(v) > 0);

  return (
    <div className={styles.step}>
      {/* <img src={measureIcon} alt="Body measurements" className={styles.icon} /> */}
      <h1>Please update your body measurements</h1>

      <div className={styles.measureGrid}>
        {[
          { label: "Neck", key: "neck" },
          { label: "Waist", key: "waist" },
          { label: "Hip", key: "hip" },
          { label: "Biceps", key: "biceps" },
          { label: "Thigh", key: "thigh" },
        ].map((item) => (
          <div key={item.key} className={styles.measureItem}>
            <label>{item.label}:</label>
            <div className={styles.inputWrapperSmall}>
              <input
                type="number"
                step="0.1"
                placeholder="0"
                value={measurements[item.key as keyof typeof measurements]}
                onChange={(e) => handleChange(item.key, e.target.value)}
                className={styles.inputSmall}
              />
              <span className={styles.unitSmall}>cm</span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => onNext(measurements)}
        disabled={!allFilled}
        className={styles.nextBtn}
        style={{ marginTop: 32 }}
      >
        Next
      </button>
    </div>
  );
}
