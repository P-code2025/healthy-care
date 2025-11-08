import styles from './MenuCard.module.css';

interface Props {
  title: string;
  calories: number;
  category: string;
  image: string;
  carbs: number;
  protein: number;
  fats: number;
}

export default function MenuCard({ title, calories, image, carbs, protein, fats }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.badge}>
        <span className={styles.badgeIcon}>🍃</span>
        <span className={styles.badgeText}>{calories} kcal</span>
      </div>
      <div className={styles.imageWrapper}>
        <img src={image} alt={title} className={styles.image} />
      </div>
      <div className={styles.content}>
        <h4 className={styles.title}>{title}</h4>
        <div className={styles.nutrition}>
          <div className={styles.nutrientItem}>
            <span className={styles.nutrientIcon}>🍞</span>
            <span className={styles.nutrientValue}>{carbs}g</span>
          </div>
          <div className={styles.nutrientItem}>
            <span className={styles.nutrientIcon}>🥩</span>
            <span className={styles.nutrientValue}>{protein}g</span>
          </div>
          <div className={styles.nutrientItem}>
            <span className={styles.nutrientIcon}>🥑</span>
            <span className={styles.nutrientValue}>{fats}g</span>
          </div>
        </div>
      </div>
    </div>
  );
}
