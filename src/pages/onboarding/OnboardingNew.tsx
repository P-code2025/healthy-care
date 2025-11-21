// src/pages/onboarding/OnboardingNew.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { formatGoalWeight } from "../../utils/profile";
import { messages } from "../../i18n/messages";
import { getErrorMessage } from "../../utils/errorMessages";

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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
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

    const saveOnboardingData = async (data: typeof formData) => {
        const goalWeightValue = Number(data.goalWeight) || 0;
        await api.updateCurrentUser({
            name: data.name || undefined,
            age: parseInt(data.age.toString()) || undefined,
            gender: data.gender || undefined,
            height_cm: parseFloat(data.height.toString()) || undefined,
            weight_kg: parseFloat(data.weight.toString()) || undefined,
            goal: formatGoalWeight(goalWeightValue),
        });

        // Refresh user profile in auth context
        const updatedUser = await refreshUser();

        // Verify user is properly onboarded before navigating
        if (!updatedUser?.weight_kg || !updatedUser?.height_cm) {
            throw new Error(messages.onboarding.verificationError);
        }

        return updatedUser;
    };

    const next = async (data: Partial<typeof formData>) => {
        const newData = { ...formData, ...data };
        setFormData(newData);
        setError(null);

        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            // Final step - save data
            setIsSubmitting(true);
            try {
                await saveOnboardingData(newData);
                navigate("/");
            } catch (err) {
                const errorConfig = getErrorMessage(err);
                setError(errorConfig.message);
                console.error("Failed to save onboarding data:", err);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const prev = () => {
        if (step > 0) {
            setStep(step - 1);
            setError(null);
        }
    };

    const retry = () => {
        setError(null);
        next({}); // Retry with current form data
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

            {isSubmitting ? (
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner} />
                    <p className={styles.loadingText}>Setting up your profile...</p>
                </div>
            ) : error ? (
                <div className={styles.errorContainer}>
                    <div className={styles.errorIcon}>⚠️</div>
                    <h2 className={styles.errorTitle}>Unable to Complete Setup</h2>
                    <p className={styles.errorMessage}>{error}</p>
                    <div className={styles.errorActions}>
                        <button onClick={retry} className={styles.retryBtn}>
                            Try Again
                        </button>
                        <button onClick={prev} className={styles.backBtn}>
                            Go Back
                        </button>
                    </div>
                </div>
            ) : (
                <CurrentStep data={formData} onNext={next} onPrev={prev} />
            )}

            {step > 0 && !isSubmitting && !error && (
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
