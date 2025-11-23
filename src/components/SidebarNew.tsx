import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./SidebarNew.module.css";

const menuItems = [
  { name: "Dashboard", icon: "📊", path: "/", badge: null },
  { name: "Calendar", icon: "📅", path: "/calendar", badge: null },
  { name: "AI Chat", icon: "💬", path: '/messages', badge: null },
  { name: "Healthy Menu", icon: "🥗", path: "/healthy-menu", badge: null },
  { name: "Meal Plan", icon: "📝", path: "/meal-plan", badge: null },
  { name: "Food Diary", icon: "📔", path: "/food-diary", badge: null },
  { name: "Progress", icon: "📈", path: "/progress", badge: null },
  { name: "Exercises", icon: "🏋️", path: "/exercises", badge: null },
  { name: "Health Insights", icon: "💡", path: "/health-insights", badge: null },
  { name: "Settings", icon: "⚙️", path: "/settings", badge: null },
];

export default function SidebarNew() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>🍃</div>
        <span className={styles.logoText}>NutriAI</span>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ""}`
            }
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navText}>{item.name}</span>
            {item.badge && <span className={styles.badge}>{item.badge}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={styles.promoCard}>
        <div className={styles.promoImage}>
          🥕
          <div className={styles.veggie1}>🥬</div>
          <div className={styles.veggie2}>🥕</div>
        </div>
        <h3 className={styles.promoTitle}>Start your health journey</h3>
        <p className={styles.promoSubtitle}>
          with a <strong>FREE 1-month</strong> access to NutriAI
        </p>
        <button className={styles.promoBtn}>Claim Now!</button>
      </div>

      <div className={styles.logoutSection}>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          <span className={styles.logoutIcon}>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}