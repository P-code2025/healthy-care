// src/pages/onboarding/steps/StepBasicInfo.tsx
import { useState } from 'react';
import styles from '../OnboardingNew.module.css';

interface Props {
    data: any;
    onNext: (data: any) => void;
    onPrev?: () => void;
}

export default function StepBasicInfo({ data, onNext }: Props) {
    const [name, setName] = useState(data.name || '');
    const [age, setAge] = useState(data.age || '');
    const [gender, setGender] = useState(data.gender || '');

    const isValid = name.trim() && age && parseInt(age) >= 10 && parseInt(age) <= 100 && gender;

    const handleNext = () => {
        if (isValid) {
            onNext({ name, age: parseInt(age), gender });
        }
    };

    return (
        <div className={styles.step}>
            <h1>Let's get to know you</h1>
            <p className={styles.subtitle}>Tell us a bit about yourself to personalize your experience</p>

            <div className={styles.formGroup}>
                <label className={styles.label}>Your Name</label>
                <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={styles.input}
                    autoFocus
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Age</label>
                <div className={styles.inputWrapper}>
                    <input
                        type="number"
                        placeholder="Enter your age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className={styles.input}
                        min="10"
                        max="100"
                    />
                    <span className={styles.unit}>years</span>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Gender</label>
                <div className={styles.genderGroup}>
                    <button
                        onClick={() => setGender('Nam')}
                        className={`${styles.genderBtn} ${gender === 'Nam' ? styles.selected : ''}`}
                        type="button"
                    >
                        👨 Male
                    </button>
                    <button
                        onClick={() => setGender('Nữ')}
                        className={`${styles.genderBtn} ${gender === 'Nữ' ? styles.selected : ''}`}
                        type="button"
                    >
                        👩 Female
                    </button>
                </div>
            </div>

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
