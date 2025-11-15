// src/components/Layout.tsx
import React from "react";
import { Outlet } from "react-router-dom"; // Needed for nested routes
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
          <Outlet /> {/* Renders nested routes */}
        </div>
      </main>
    </div>
  );
};

export default Layout;
