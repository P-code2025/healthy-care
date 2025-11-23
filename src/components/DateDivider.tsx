import styles from './DateDivider.module.css';

interface DateDividerProps {
    label: string;
}

export function DateDivider({ label }: DateDividerProps) {
    return (
        <div className={styles.divider}>
            <span className={styles.label}>{label}</span>
        </div>
    );
}
