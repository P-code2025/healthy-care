// src/pages/onboarding/OnboardingNew.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { formatGoalWeight } from "../../utils/profile";
import { messages } from "../../i18n/messages";

import styles from "./OnboardingNew.module.css";
import StepBasicInfo from "./steps/StepBasicInfo";
import StepBodyStats from "./steps/StepBodyStats";
import StepGoalSelection from "./steps/StepGoalSelection";

const steps = [
    StepBasicInfo,
    StepBodyStats,
    StepGoalSelection,
];

export default function OnboardingNew() {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        name: "",
        gender: "",
        age: "",
        weight: "",
        height: "",
        goalWeight: "",
        tdee: 0,
        recommendedCalories: 0,
        goalType: "maintain",
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
                    age: parseInt(newData.age.toString()) || undefined,
                    gender: newData.gender || undefined,
                    height_cm: parseFloat(newData.height.toString()) || undefined,
                    weight_kg: parseFloat(newData.weight.toString()) || undefined,
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
        <div style={{ minHeight: '100vh', background: '#f9fafb', paddingTop: '40px' }}>
            {/* Progress Indicator */}
            <div className={styles.progress}>
                {steps.map((_, i) => (
                    <div
                        key={i}
                        className={`${styles.progressDot} ${i === step ? styles.active : ''} ${i < step ? styles.active : ''}`}
                    />
                ))}
            </div>

            <CurrentStep data={formData} onNext={next} onPrev={prev} />

            {step > 0 && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button
                        onClick={prev}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#6b7280',
                            fontSize: '14px',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                        }}
                    >
                        ← Go Back
                    </button>
                </div>
            )}
        </div>
    );
}
