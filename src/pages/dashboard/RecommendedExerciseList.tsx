import styles from "./RecommendedExerciseList.module.css";

export default function RecommendedExerciseList({
  items,
}: {
  items: { title: string }[];
}) {
  return (
    <div className={styles.card}>
      <h4 className={styles.title}>Recommended Exercises</h4>
      <ul className={styles.list}>
        {items.map((i) => (
          <li key={i.title} className={styles.item}>
            <p className={styles.itemTitle}>{i.title}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
