// src/pages/onboarding/steps/StepBodyMeasurements.tsx
import { useState } from 'react';
import styles from '../OnboardingNew.module.css';

interface Props {
    data: any;
    onNext: (data: any) => void;
    onPrev?: () => void;
}

export default function StepBodyMeasurements({ data, onNext }: Props) {
    const [neck, setNeck] = useState(data.neck || '');
    const [waist, setWaist] = useState(data.waist || '');
    const [hip, setHip] = useState(data.hip || '');
    const [biceps, setBiceps] = useState(data.biceps || '');
    const [thigh, setThigh] = useState(data.thigh || '');

    const isValid = neck && waist && hip && biceps && thigh &&
        [neck, waist, hip, biceps, thigh].every(v => parseFloat(v) > 10 && parseFloat(v) < 200);

    const handleNext = () => {
        if (isValid) {
            onNext({
                neck: parseFloat(neck),
                waist: parseFloat(waist),
                hip: parseFloat(hip),
                biceps: parseFloat(biceps),
                thigh: parseFloat(thigh),
            });
        }
    };

    return (
        <div className={styles.step}>
            <h1>Body Measurements</h1>
            <p className={styles.subtitle}>Measure in cm for better body fat & progress tracking</p>

            <div className={styles.formGroup}>
                <label className={styles.label}>Neck Circumference</label>
                <div className={styles.inputWrapper}>
                    <input type="number" value={neck} onChange={e => setNeck(e.target.value)} className={styles.input} placeholder="e.g. 38" />
                    <span className={styles.unit}>cm</span>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Waist (at navel)</label>
                <div className={styles.inputWrapper}>
                    <input type="number" value={waist} onChange={e => setWaist(e.target.value)} className={styles.input} placeholder="e.g. 80" />
                    <span className={styles.unit}>cm</span>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Hip (widest part)</label>
                <div className={styles.inputWrapper}>
                    <input type="number" value={hip} onChange={e => setHip(e.target.value)} className={styles.input} placeholder="e.g. 95" />
                    <span className={styles.unit}>cm</span>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Biceps (flexed)</label>
                <div className={styles.inputWrapper}>
                    <input type="number" value={biceps} onChange={e => setBiceps(e.target.value)} className={styles.input} placeholder="e.g. 32" />
                    <span className={styles.unit}>cm</span>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Thigh (mid-thigh)</label>
                <div className={styles.inputWrapper}>
                    <input type="number" value={thigh} onChange={e => setThigh(e.target.value)} className={styles.input} placeholder="e.g. 55" />
                    <span className={styles.unit}>cm</span>
                </div>
            </div>

            <button onClick={handleNext} disabled={!isValid} className={styles.nextBtn}>
                Continue
            </button>
        </div>
    );
}