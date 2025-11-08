import styles from "./RecentActivity.module.css";

export default function RecentActivity({
  items,
}: {
  items: { time: string; text: string }[];
}) {
  return (
    <aside className={styles.card}>
      <h4 className={styles.title}>Recent Activity</h4>
      <ul className={styles.list}>
        {items.map((i, idx) => (
          <li key={idx} className={styles.item}>
            <span className={styles.time}>{i.time}</span>
            <span className={styles.text}>{i.text}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
