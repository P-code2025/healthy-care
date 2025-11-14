// src/components/Header.tsx
import { useEffect, useState } from "react";
import styles from "./Header.module.css";

export default function Header() {
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const profile = localStorage.getItem("userProfile");
    if (profile) {
      const data = JSON.parse(profile);
      setUserName(data.name || "User");
    }
  }, []);

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