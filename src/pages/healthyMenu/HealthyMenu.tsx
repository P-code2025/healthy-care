// src/pages/healthyMenu/HealthyMenu.tsx

import { useEffect, useState } from "react";
import { api } from "../../services/api";
import type { FoodLog } from "../../services/api";
import styles from "./HealthyMenu.module.css";

// Component Card món ăn (tạo bên trong file này cho tiện)
function RecipeCard({ food }: { food: FoodLog }) {
  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>{food.food_name}</h3>
      <ul className={styles.nutritionList}>
        <li>
          <span>Calories:</span>
          <strong>{food.calories} kcal</strong>
        </li>
        <li>
          <span>Protein:</span>
          <strong>{food.protein_g} g</strong>
        </li>
        <li>
          <span>Carbs:</span>
          <strong>{food.carbs_g} g</strong>
        </li>
        <li>
          <span>Fat:</span>
          <strong>{food.fat_g} g</strong>
        </li>
      </ul>
      <p style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
        {food.health_consideration}
      </p>
    </div>
  );
}

// Trang chính
export default function HealthyMenu() {
  const [recipes, setRecipes] = useState<FoodLog[]>([]);

  useEffect(() => {
    // Chúng ta sẽ dùng food_log làm "danh sách món ăn"
    // Lọc ra các món ăn không trùng lặp (tạm thời)
    api.getFoodLog().then((logs) => {
      const uniqueFoods = Array.from(
        new Map(logs.map((item) => [item.food_name, item])).values()
      );
      setRecipes(uniqueFoods);
    });
  }, []);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Healthy Menu (Based on Food Log)</h2>

      <div className={styles.grid}>
        {recipes.map((food) => (
          <RecipeCard key={food.log_id} food={food} />
        ))}
      </div>
    </div>
  );
}
