import { useEffect, useState } from 'react';
import { useToast } from '../hooks/useToast';
import type { ToastData } from '../hooks/useToast';
import styles from './Toast.module.css';

const ICONS = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
};

interface ToastItemProps {
    toast: ToastData;
    onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
    const [progress, setProgress] = useState(100);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (!toast.duration || toast.duration <= 0) return;

        const interval = 10; // Update every 10ms
        const decrement = (100 * interval) / toast.duration;

        const timer = setInterval(() => {
            setProgress((prev) => {
                const next = prev - decrement;
                return next > 0 ? next : 0;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [toast.duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 300); // Match animation duration
    };

    return (
        <div
            className={`${styles.toast} ${styles[toast.type]} ${isExiting ? styles.exiting : ''}`}
            role="alert"
        >
            <div className={styles.icon}>
                <div className={styles.iconCircle}>{ICONS[toast.type]}</div>
            </div>

            <div className={styles.content}>
                <div className={styles.message}>{toast.message}</div>
                {toast.action && (
                    <button
                        onClick={() => {
                            toast.action?.onClick();
                            handleClose();
                        }}
                        className={styles.actionBtn}
                    >
                        {toast.action.label}
                    </button>
                )}
            </div>

            <button onClick={handleClose} className={styles.closeBtn} aria-label="Close">
                ✕
            </button>

            {toast.duration && toast.duration > 0 && (
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    );
}

export default function ToastContainer() {
    const { toasts, hideToast } = useToast();

    return (
        <div className={styles.container}>
            {toasts.map((toast) => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    onClose={() => hideToast(toast.id)}
                />
            ))}
        </div>
    );
}
