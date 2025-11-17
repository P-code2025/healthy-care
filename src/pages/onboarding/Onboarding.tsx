// src/pages/onboarding/Onboarding.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { formatGoalWeight } from "../../utils/profile";
import { messages } from "../../i18n/messages";

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
  const { refreshUser } = useAuth();
  const CurrentStep = steps[step];

  const next = async (data: Partial<typeof formData>) => {
    const newData = { ...formData, ...data };
    setFormData(newData);

    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      try {
        // Save to backend API
        const goalWeightValue = Number(newData.goalWeight) || 0;
        await api.updateCurrentUser({
          name: newData.name || undefined,
          age: parseInt(newData.age) || undefined,
          gender: newData.gender || undefined,
          height_cm: parseFloat(newData.height) || undefined,
          weight_kg: parseFloat(newData.weight) || undefined,
          neck_cm: parseFloat(newData.neck) || undefined,
          waist_cm: parseFloat(newData.waist) || undefined,
          hip_cm: parseFloat(newData.hip) || undefined,
          biceps_cm: parseFloat(newData.biceps) || undefined,
          thigh_cm: parseFloat(newData.thigh) || undefined,
          goal: formatGoalWeight(goalWeightValue),
        });
        // Refresh user profile in auth context
        const updatedUser = await refreshUser();
        // Verify user is properly onboarded before navigating
        if (updatedUser?.weight_kg && updatedUser?.height_cm) {
          navigate("/");
        } else {
          alert(messages.onboarding.verificationError);
        }
      } catch (error) {
        console.error("Failed to save onboarding data:", error);
        alert(messages.onboarding.saveError);
      }
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
          {messages.common.goBack}
        </button>
      )}
    </div>
  );
}
