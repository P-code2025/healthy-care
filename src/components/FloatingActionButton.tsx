import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FloatingActionButton.module.css';

interface QuickAction {
    icon: string;
    label: string;
    path: string;
    color: string;
}

const QUICK_ACTIONS: QuickAction[] = [
    {
        icon: '🍽️',
        label: 'Add Meal',
        path: '/food-diary',
        color: '#FFB84D',
    },
    {
        icon: '🏋️',
        label: 'Log Workout',
        path: '/exercises',
        color: '#BAE6FD',
    },
    {
        icon: '💧',
        label: 'Add Water',
        path: '/food-diary',
        color: '#29B6F6',
    },
];

export default function FloatingActionButton() {
    const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();

    const handleAction = (path: string) => {
        navigate(path);
        setIsExpanded(false);
    };

    return (
        <div className={styles.fabContainer}>
            {/* Backdrop */}
            {isExpanded && (
                <div
                    className={styles.backdrop}
                    onClick={() => setIsExpanded(false)}
                />
            )}

            {/* Action buttons */}
            {isExpanded && (
                <div className={styles.actionsList}>
                    {QUICK_ACTIONS.map((action, index) => (
                        <button
                            key={action.label}
                            className={styles.actionBtn}
                            onClick={() => handleAction(action.path)}
                            style={{
                                transitionDelay: `${index * 50}ms`,
                            }}
                            title={action.label}
                        >
                            <div className={styles.actionIcon} style={{ background: action.color }}>
                                {action.icon}
                            </div>
                            <span className={styles.actionLabel}>{action.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Main FAB button */}
            <button
                className={`${styles.fab} ${isExpanded ? styles.expanded : ''}`}
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label="Quick actions"
                aria-expanded={isExpanded}
            >
                <div className={styles.fabIcon}>
                    {isExpanded ? '✕' : '+'}
                </div>
            </button>
        </div>
    );
}
