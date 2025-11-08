import styles from "./DashboardCard.module.css";

interface Props {
  title: string;
  value: string | number;
  unit?: string;
}

export default function DashboardCard({ title, value, unit }: Props) {
  return (
    <div className={styles.card}>
      <h4 className={styles.title}>{title}</h4>
      <p className={styles.value}>
        {value} {unit}
      </p>
    </div>
  );
}
