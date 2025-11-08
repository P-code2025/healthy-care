import styles from "./RecommendedMenuList.module.css";

export default function RecommendedMenuList({
  items,
}: {
  items: { title: string }[];
}) {
  return (
    <div className={styles.card}>
      <h4 className={styles.title}>Recommended Menu</h4>
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
