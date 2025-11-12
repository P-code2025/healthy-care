// src/pages/onboarding/Onboarding.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Đúng đường dẫn

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
  const { finishOnboarding } = useAuth(); // Lấy hàm
  const CurrentStep = steps[step];

  const next = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));

    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // Hoàn thành → lưu dữ liệu + đánh dấu đã onboard
      const finalData = { ...formData, ...data };
      console.log("Final onboarding data:", finalData);

      // TODO: Gọi API lưu thông tin người dùng ở đây
      // await saveUserProfile(finalData);

      finishOnboarding(); // Đánh dấu đã hoàn thành onboarding
      navigate("/"); // Vào dashboard
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
          ←
        </button>
      )}
    </div>
  );
}