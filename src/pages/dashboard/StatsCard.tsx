import styles from './StatsCard.module.css';

interface Props {
  title: string;
  value: string | number;
  unit?: string;
  icon: string;
  subtitle?: string;
}

export default function StatsCard({ title, value, unit, icon, subtitle }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <span className={styles.icon}>{icon}</span>
        </div>
      </div>
      <h4 className={styles.title}>{title}</h4>
      <p className={styles.value}>
        {value}
        {unit && <span className={styles.unit}>{unit}</span>}
      </p>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
}
