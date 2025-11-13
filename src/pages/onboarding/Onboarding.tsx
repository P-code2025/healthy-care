// src/pages/onboarding/Onboarding.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import styles from "./Onboarding.module.css";
import StepName from "./steps/StepName";
import StepGender from "./steps/StepGender";
import StepAge from "./steps/StepAge";
import StepWeight from "./steps/StepWeight";
import StepHeight from "./steps/StepHeight";
import StepMeasurements from "./steps/StepMeasurements";
import StepGoal from "./steps/StepGoal";

const steps = [
  StepName,
  StepGender,
  StepAge,
  StepWeight,
  StepHeight,
  StepMeasurements,
  StepGoal,
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    age: "",
    weight: "",
    height: "",
    neck: "",
    waist: "",
    hip: "",
    biceps: "",
    thigh: "",
    goalWeight: "",
  });

  const navigate = useNavigate();
  const { finishOnboarding } = useAuth();
  const CurrentStep = steps[step];

  const next = (data: Partial<typeof formData>) => {
    const newData = { ...formData, ...data };
    const savedEmail = localStorage.getItem("userEmail") || "";
    const finalData = { ...newData, email: savedEmail };
    setFormData(newData);

    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // LƯU VÀO LOCALSTORAGE
      localStorage.setItem("userProfile", JSON.stringify(finalData));
      finishOnboarding();
      navigate("/");
    }
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className={styles.container}>
      <CurrentStep data={formData} onNext={next} onPrev={prev} />
      {step > 0 && (
        <button onClick={prev} className={styles.backBtn}>
          Back
        </button>
      )}
    </div>
  );
}