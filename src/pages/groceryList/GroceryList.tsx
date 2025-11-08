// src/pages/GroceryList/GroceryList.tsx
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import type { AiSuggestion } from "../../services/api";
import styles from "./GroceryList.module.css";

function categorizeItem(item: string): string {
  const lower = item.toLowerCase();
  if (["oats", "rice", "quinoa", "bread"].includes(lower)) return "Grains";
  if (["banana", "apple", "orange", "berries"].includes(lower)) return "Fruits";
  if (["spinach", "broccoli", "carrot", "tomato"].includes(lower))
    return "Vegetables";
  if (["chicken", "beef", "fish", "egg"].includes(lower)) return "Protein";
  if (["milk", "yogurt", "cheese"].includes(lower)) return "Dairy";
  if (["almond butter", "chips", "cookies"].includes(lower)) return "Snacks";
  return "Other";
}

export default function GroceryList() {
  const [categorized, setCategorized] = useState<Record<string, string[]>>({});

  useEffect(() => {
    // Dòng code đã sửa
    api.getAiSuggestions().then((data: AiSuggestion[]) => {
      const nutritionPlans = data.filter((s) => s.type === "nutrition");
      const allItems: string[] = [];
      nutritionPlans.forEach((p) => {
        p.content_details.meal_plan.forEach((meal: any) => {
          allItems.push(...meal.items);
        });
      });

      const grouped: Record<string, string[]> = {};
      allItems.forEach((item) => {
        const cat = categorizeItem(item);
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(item);
      });
      setCategorized(grouped);
    });
  }, []);

  const totalItems = Object.values(categorized).reduce(
    (sum, arr) => sum + arr.length,
    0
  );
  const totalCategories = Object.keys(categorized).length;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Grocery List</h2>
      <p>
        Total Items: {totalItems} | Categories: {totalCategories}
      </p>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Category</th>
            <th>Items</th>
            <th>Quantity</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(categorized).map(([cat, items]) => (
            <tr key={cat}>
              <td>{cat}</td>
              <td>{items.join(", ")}</td>
              <td>{items.length}</td>
              <td>
                <button className={styles.statusBtn}>Not Purchased</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
