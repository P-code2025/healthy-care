// src/pages/GroceryList/components/GroceryItemRow.tsx
import styles from "../GroceryList.module.css";

export default function GroceryItemRow({ item }: { item: string }) {
  return (
    <tr>
      <td>{item}</td>
      <td>1</td>
      <td>
        <button className={styles.statusBtn}>Not Purchased</button>
      </td>
    </tr>
  );
}
