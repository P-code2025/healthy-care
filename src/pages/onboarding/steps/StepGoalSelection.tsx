// src/pages/onboarding/steps/StepGoalSelection.tsx
import { useState, useEffect } from 'react';
import styles from '../OnboardingNew.module.css';
import { calculateTDEE, calculateCalorieGoal, determineGoalType } from '../../../utils/healthCalculations';

interface Props {
    data: any;
    onNext: (data: any) => void;
    onPrev?: () => void;
}

export default function StepGoalSelection({ data, onNext }: Props) {
    const [goalWeight, setGoalWeight] = useState(data.goalWeight || '');
    const [showResults, setShowResults] = useState(false);

    const currentWeight = parseFloat(data.weight);
    const targetWeight = parseFloat(goalWeight);
    const isValid = targetWeight > 0 && targetWeight < 300;

    // Calculate TDEE
    const tdee = calculateTDEE({
        weightKg: currentWeight,
        heightCm: parseFloat(data.height),
        age: parseInt(data.age),
        gender: data.gender,
        activityLevel: 'moderate'
    });

    // Determine goal type
    const goalType = isValid ? determineGoalType(currentWeight, targetWeight) : 'maintain';

    // Calculate recommended calories
    const recommendedCalories = calculateCalorieGoal({
        tdee,
        goalType
    });

    const weightDiff = targetWeight - currentWeight;
    const weeksToGoal = Math.abs(weightDiff) / 0.5; // Assuming 0.5kg per week

    useEffect(() => {
        setShowResults(isValid);
    }, [isValid]);

    const handleNext = () => {
        if (isValid) {
            onNext({
                goalWeight: targetWeight,
                tdee,
                recommendedCalories,
                goalType
            });
        }
    };

    const getGoalMessage = () => {
        if (!isValid) return '';
        if (goalType === 'lose') return `Lose ${Math.abs(weightDiff).toFixed(1)}kg`;
        if (goalType === 'gain') return `Gain ${Math.abs(weightDiff).toFixed(1)}kg`;
        return 'Maintain current weight';
    };

    return (
        <div className={styles.step}>
            <h1>Set Your Goal</h1>
            <p className={styles.subtitle}>What's your target weight?</p>

            <div className={styles.formGroup}>
                <label className={styles.label}>Target Weight</label>
                <div className={styles.inputWrapper}>
                    <input
                        type="number"
                        placeholder="Enter target weight"
                        value={goalWeight}
                        onChange={(e) => setGoalWeight(e.target.value)}
                        className={styles.input}
                        min="30"
                        max="300"
                        step="0.1"
                        autoFocus
                    />
                    <span className={styles.unit}>kg</span>
                </div>
                <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                    Current weight: {currentWeight}kg
                </p>
            </div>

            {showResults && (
                <div className={styles.resultsPreview}>
                    <div className={styles.resultsTitle}>🎯 Your Personalized Plan</div>

                    <div className={styles.resultsGrid}>
                        <div className={styles.resultCard}>
                            <div className={styles.resultLabel}>Daily Calories</div>
                            <div className={styles.resultValue}>{recommendedCalories}</div>
                            <div className={styles.resultMessage}>kcal per day</div>
                        </div>

                        <div className={styles.resultCard}>
                            <div className={styles.resultLabel}>Your Goal</div>
                            <div className={styles.resultValue}>
                                {goalType === 'lose' && '📉'}
                                {goalType === 'gain' && '📈'}
                                {goalType === 'maintain' && '⚖️'}
                            </div>
                            <div className={styles.resultMessage}>{getGoalMessage()}</div>
                        </div>
                    </div>

                    {goalType !== 'maintain' && (
                        <div style={{
                            marginTop: '16px',
                            padding: '16px',
                            background: 'white',
                            borderRadius: '12px',
                            fontSize: '14px',
                            color: '#374151'
                        }}>
                            <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                                📅 Estimated Timeline
                            </div>
                            <div>
                                At a healthy pace of 0.5kg/week, you'll reach your goal in approximately{' '}
                                <strong>{Math.ceil(weeksToGoal)} weeks</strong>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <button
                onClick={handleNext}
                disabled={!isValid}
                className={styles.nextBtn}
            >
                Let's Start! 🚀
            </button>
        </div>
    );
}
