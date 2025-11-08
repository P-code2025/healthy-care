import styles from "./WorkoutProgressList.module.css";

interface Item {
  name: string;
  value: number;
}

export default function WorkoutProgressList({ items }: { items: Item[] }) {
  return (
    <div className={styles.card}>
      <h4 className={styles.title}>Workout Progress</h4>
      <div className={styles.list}>
        {items.map((it) => (
          <div key={it.name} className={styles.item}>
            <div className={styles.label}>
              <span className={styles.labelName}>{it.name}</span>
              <span className={styles.labelValue}>{it.value}%</span>
            </div>
            <div className={styles.bar}>
              <div className={styles.fill} style={{ width: `${it.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
