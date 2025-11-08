import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LuLayoutDashboard,
  LuCalendar,
  LuMessageSquare,
  LuHeartPulse,
  LuScrollText,
  LuListTodo,
  LuTrendingUp,
  LuIterationCcw,
  LuSettings,
  LuLogOut,
  LuSalad,
  LuChevronDown,
} from "react-icons/lu";
import styles from "./SidebarLeft.module.css";

const menuItems = [
  { name: "Dashboard", icon: <LuLayoutDashboard size={20} />, path: "/" },
  { name: "Calendar", icon: <LuCalendar size={20} />, path: "/calendar" },
  { name: "Messages", icon: <LuMessageSquare size={20} />, path: "/messages" },
  { name: "Healthy Menu", icon: <LuSalad size={20} />, path: "/healthy-menu" },
  {
    name: "Meal Plan",
    icon: <LuScrollText size={20} />,
    children: [
      { name: "Meal Plan", path: "/meal-plan" },
      { name: "Grocery List", path: "/grocery-list" },
    ],
  },
  { name: "Food Diary", icon: <LuListTodo size={20} />, path: "/food-diary" },
  { name: "Progress", icon: <LuTrendingUp size={20} />, path: "/progress" },
  { name: "Exercises", icon: <LuIterationCcw size={20} />, path: "/exercises" },
  {
    name: "Health Insights",
    icon: <LuHeartPulse size={20} />,
    path: "/health-insights",
  },
  { name: "Settings", icon: <LuSettings size={20} />, path: "/settings" },
];

const SidebarLeft: React.FC = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();

  const isMealPlanActive =
    location.pathname.startsWith("/meal-plan") ||
    location.pathname.startsWith("/grocery-list");

  useEffect(() => {
    if (!isMealPlanActive && openDropdown === "Meal Plan") {
      setOpenDropdown(null);
    }
  }, [location.pathname]);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <h1>Nutrigo</h1>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) =>
          item.children ? (
            <div key={item.name}>
              <button
                type="button"
                className={`${styles.navLink} ${
                  isMealPlanActive ? styles.parentActive : ""
                } ${
                  openDropdown === item.name && !isMealPlanActive
                    ? styles.open
                    : ""
                }`}
                onClick={() =>
                  setOpenDropdown(openDropdown === item.name ? null : item.name)
                }
              >
                {item.icon}
                <span>{item.name}</span>
                <LuChevronDown
                  className={`${styles.chevron} ${
                    openDropdown === item.name ? styles.rotate : ""
                  }`}
                  size={16}
                />
              </button>

              {openDropdown === item.name && (
                <ul className={styles.submenu}>
                  {item.children.map((child) => (
                    <li key={child.name}>
                      <NavLink
                        to={child.path}
                        className={({ isActive }) =>
                          `${styles.subLink} ${isActive ? styles.active : ""}`
                        }
                      >
                        {child.name}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <NavLink
              key={item.name}
              to={item.path}
              end
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          )
        )}
      </nav>

      {/* Banner quảng cáo */}
      <div className={styles.adCard}>
        <div className={styles.adCardInner}>
          <h4>Start your health journey</h4>
          <p>with a FREE 1-month access to Nutrigo!</p>
          <button className={styles.adButton}>Claim Now!</button>
        </div>
      </div>

      {/* Logout */}
      <div className={styles.logout}>
        <button className={styles.logoutButton}>
          <LuLogOut size={20} />
          <span style={{ marginLeft: "12px" }}>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default SidebarLeft;
