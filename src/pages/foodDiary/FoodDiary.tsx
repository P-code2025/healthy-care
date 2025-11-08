// src/pages/foodDiary/FoodDiary.tsx

import { useEffect, useState } from "react";
import { api } from "../../services/api";
import type { FoodLog } from "../../services/api";
import styles from "./FoodDiary.module.css";

// 1. IMPORT DashboardCard để làm KPI
import DashboardCard from "../dashboard/DashboardCard";
// 2. Import component Table (chúng ta sẽ tách nó ra)
import FoodDiaryTable from "./components/FoodDiaryTable";

export default function FoodDiary() {
  const [logs, setLogs] = useState<FoodLog[]>([]);

  useEffect(() => {
    api
      .getFoodLog()
      .then((data) => {
        setLogs(data);
      })
      .catch((err) => console.error("API error:", err));
  }, []);

  // Tính toán tổng số liệu (giống như component Summary cũ)
  const totalCalories = logs.reduce((sum, l) => sum + l.calories, 0);
  const totalCarbs = logs.reduce((sum, l) => sum + l.carbs_g, 0);
  const totalProtein = logs.reduce((sum, l) => sum + l.protein_g, 0);
  const totalFat = logs.reduce((sum, l) => sum + l.fat_g, 0);

  return (
    <div className={styles.container}>
      {/* PHẦN 1: 4 THẺ KPI (THAY THẾ CHO SUMMARY CŨ)
        Chúng ta tái sử dụng DashboardCard từ trang Dashboard
      */}
      <div className={styles.kpiGrid}>
        <DashboardCard
          title="Total Calories"
          value={totalCalories}
          unit="kcal"
        />
        <DashboardCard title="Total Carb" value={totalCarbs} unit="gr" />
        <DashboardCard title="Total Proteins" value={totalProtein} unit="gr" />
        <DashboardCard title="Total Fats" value={totalFat} unit="gr" />
      </div>

      {/* PHẦN 2: THANH ĐIỀU KHIỂN (THEO UI)
       */}
      <div className={styles.controls}>
        <input
          type="text"
          placeholder="Search menu..."
          className={styles.search}
        />
        <button className={styles.filterBtn}>Filter</button>
        <select className={styles.selectWeek}>
          <option>This Week</option>
          <option>Last Week</option>
        </select>
        <button className={styles.addBtn}>+ Add</button>
      </div>

      {/* PHẦN 3: BẢNG DỮ LIỆU
        Chúng ta dùng component FoodDiaryTable (giống code cũ)
        (Lưu ý: Bảng này chưa có cột Amount, Sugar, Thoughts vì db.json thiếu)
      */}
      <FoodDiaryTable logs={logs} />
    </div>
  );
}
