// src/pages/onboarding/steps/StepBodyStats.tsx
import { useState, useEffect } from 'react';
import styles from '../OnboardingNew.module.css';
import { calculateBMI, getBMICategory } from '../../../utils/healthCalculations';

interface Props {
    data: any;
    onNext: (data: any) => void;
    onPrev?: () => void;
}

export default function StepBodyStats({ data, onNext }: Props) {
    const [weight, setWeight] = useState(data.weight || '');
    const [height, setHeight] = useState(data.height || '');
    const [showResults, setShowResults] = useState(false);

    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const isValid = weightNum > 0 && weightNum < 300 && heightNum > 0 && heightNum < 300;

    const bmi = isValid ? calculateBMI(weightNum, heightNum) : 0;
    const bmiInfo = getBMICategory(bmi);

    useEffect(() => {
        setShowResults(isValid);
    }, [isValid]);

    const handleNext = () => {
        if (isValid) {
            onNext({ weight: weightNum, height: heightNum });
        }
    };

    return (
        <div className={styles.step}>
            <h1>Your Body Stats</h1>
            <p className={styles.subtitle}>We'll use this to calculate your personalized health metrics</p>

            <div className={styles.formGroup}>
                <label className={styles.label}>Weight</label>
                <div className={styles.inputWrapper}>
                    <input
                        type="number"
                        placeholder="Enter your weight"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className={styles.input}
                        min="30"
                        max="300"
                        step="0.1"
                        autoFocus
                    />
                    <span className={styles.unit}>kg</span>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Height</label>
                <div className={styles.inputWrapper}>
                    <input
                        type="number"
                        placeholder="Enter your height"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className={styles.input}
                        min="100"
                        max="250"
                        step="0.1"
                    />
                    <span className={styles.unit}>cm</span>
                </div>
            </div>

            {showResults && (
                <div className={styles.resultsPreview}>
                    <div className={styles.resultsTitle}>✨ Your Health Metrics</div>
                    <div className={styles.resultsGrid}>
                        <div className={styles.resultCard}>
                            <div className={styles.resultLabel}>Your BMI</div>
                            <div className={styles.resultValue}>{bmi.toFixed(1)}</div>
                            <div
                                className={styles.resultCategory}
                                style={{ backgroundColor: bmiInfo.color + '20', color: bmiInfo.color }}
                            >
                                {bmiInfo.category}
                            </div>
                            <div className={styles.resultMessage}>{bmiInfo.message}</div>
                        </div>
                        <div className={styles.resultCard}>
                            <div className={styles.resultLabel}>Weight Status</div>
                            <div className={styles.resultValue}>
                                {weightNum > 0 ? `${weightNum}kg` : '-'}
                            </div>
                            <div className={styles.resultMessage}>
                                {heightNum > 0 ? `Height: ${heightNum}cm` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={handleNext}
                disabled={!isValid}
                className={styles.nextBtn}
            >
                Continue
            </button>
        </div>
    );
}
