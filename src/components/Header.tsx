// src/components/Header.tsx
import { useEffect, useState } from "react";
import styles from "./Header.module.css";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user } = useAuth();
  const userName = user?.name || "User"; 

  return (
    <header className={styles.header}>
      <div className={styles.greeting}>
        <h2>Hello, {userName}! Welcome</h2>
        <p>Keep up the good work and stay healthy today.</p>
      </div>

      <div className={styles.actions}>
        <button className={styles.iconBtn}>🔔</button>
      </div>
    </header>
  );
}