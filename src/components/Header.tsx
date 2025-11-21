// src/components/Header.tsx
import styles from "./Header.module.css";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
  children?: React.ReactNode;
}

export default function Header({ children }: HeaderProps) {
  const { user } = useAuth();
  const userName = user?.name || "User";

  return (
    <header className={styles.header}>
      {children}
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