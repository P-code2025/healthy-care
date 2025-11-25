// src/pages/onboarding/steps/StepActivityPreferences.tsx
import { useState } from 'react';
import styles from '../OnboardingNew.module.css';

interface Props {
    data: any;
    onNext: (data: any) => void;
    onPrev?: () => void;
}

const activityLevels = [
    { value: "sedentary", label: "Sedentary (office job)" },
    { value: "light", label: "Light (walking, household chores)" },
    { value: "moderate", label: "Moderate (workouts 3-5 times/week)" },
    { value: "active", label: "Active (workouts 6-7 times/week)" },
    { value: "very_active", label: "Very active (athlete or heavy labor)" },
];

const preferences = [
    { key: "yoga", label: "Yoga & Meditation" },
    { key: "gym", label: "Gym / Strength Training" },
    { key: "running", label: "Running" },
    { key: "home", label: "Home Workouts" },
    { key: "swimming", label: "Swimming" },
];

export default function StepActivityPreferences({ data, onNext }: Props) {
    const [activityLevel, setActivityLevel] = useState(data.activityLevel || "moderate");
    const [exercisePreferences, setExercisePreferences] = useState(data.exercisePreferences || {
        yoga: false, gym: true, running: false, home: false, swimming: false
    });

    const togglePref = (key: string) => {
        setExercisePreferences((prev: { [x: string]: any; }) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleNext = () => {
        onNext({ activityLevel, exercisePreferences });
    };

    return (
        <div className={styles.step}>
            <h1>Activity & Preferences</h1>
            <p className={styles.subtitle}>Help us tailor workouts perfectly for you</p>

            <div className={styles.formGroup}>
                <label className={styles.label}>Daily Activity Level</label>
                <div style={{ display: 'grid', gap: '12px' }}>
                    {activityLevels.map(level => (
                        <button
                            key={level.value}
                            onClick={() => setActivityLevel(level.value)}
                            className={`${styles.genderBtn} ${activityLevel === level.value ? styles.selected : ''}`}
                            style={{ textAlign: 'left' }}
                        >
                            {level.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Preferred Exercise Types</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {preferences.map(pref => (
                        <button
                            key={pref.key}
                            onClick={() => togglePref(pref.key)}
                            className={`${styles.genderBtn} ${exercisePreferences[pref.key] ? styles.selected : ''}`}
                        >
                            {pref.label}
                        </button>
                    ))}
                </div>
            </div>

            <button onClick={handleNext} className={styles.nextBtn}>
                Complete Setup!
            </button>
        </div>
    );
}