import styles from './EmptyState.module.css';

interface EmptyStateProps {
    icon: string;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    variant?: 'default' | 'compact';
}

export default function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    onAction,
    variant = 'default'
}: EmptyStateProps) {
    return (
        <div className={`${styles.container} ${styles[variant]}`}>
            <div className={styles.iconWrapper}>
                <span className={styles.icon}>{icon}</span>
            </div>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.description}>{description}</p>
            {actionLabel && onAction && (
                <button onClick={onAction} className={styles.actionBtn}>
                    {actionLabel}
                </button>
            )}
        </div>
    );
}

// Pre-configured empty states for common scenarios
export function EmptyMeals({ onAdd }: { onAdd: () => void }) {
    return (
        <EmptyState
            icon="🍽️"
            title="No meals logged yet"
            description="Start tracking your nutrition by adding your first meal of the day."
            actionLabel="Add Meal"
            onAction={onAdd}
        />
    );
}

export function EmptyExercises({ onAdd }: { onAdd: () => void }) {
    return (
        <EmptyState
            icon="🏋️"
            title="No workouts yet"
            description="Begin your fitness journey by logging your first workout session."
            actionLabel="Log Workout"
            onAction={onAdd}
        />
    );
}

export function EmptyActivities() {
    return (
        <EmptyState
            icon="📊"
            title="No recent activity"
            description="Your activity feed will appear here as you track meals and workouts."
            variant="compact"
        />
    );
}

export function EmptyMealPlan({ onCreate }: { onCreate: () => void }) {
    return (
        <EmptyState
            icon="📝"
            title="No meal plan created"
            description="Create a personalized meal plan to stay on track with your nutrition goals."
            actionLabel="Create Plan"
            onAction={onCreate}
        />
    );
}

export function EmptyGroceryList({ onAdd }: { onAdd: () => void }) {
    return (
        <EmptyState
            icon="🛒"
            title="Your grocery list is empty"
            description="Add items to your grocery list to prepare for healthy meals."
            actionLabel="Add Items"
            onAction={onAdd}
        />
    );
}
