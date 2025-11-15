// src/components/Layout.tsx
import React from "react";
import { Outlet } from "react-router-dom"; // Thêm import này
import SidebarNew from "./SidebarNew";
import Header from "./Header";
import styles from "./Layout.module.css";

const Layout: React.FC = () => {
  return (
    <div>
      <SidebarNew />
      <main className={styles.main}>
        <Header />
        <div className={styles.content}>
          <Outlet /> {/* Thay thế cho {children} */}
        </div>
      </main>
    </div>
  );
};

export default Layout;