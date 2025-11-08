import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.greeting}>
        <h2>Hello, Adam! 👋</h2>
        <p>Keep up the good work and stay healthy today.</p>
      </div>

      <div className={styles.actions}>
        <input type="text" placeholder="Search..." className={styles.search} />
        <button className={styles.iconBtn}>🔔</button>
        <img src="/avatar.png" alt="Adam" className={styles.avatar} />
      </div>
    </header>
  );
}
