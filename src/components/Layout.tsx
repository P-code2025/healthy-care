import React from "react";
import SidebarLeft from "./SidebarLeft";
import Header from "./Header";
import styles from "./Layout.module.css";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      <SidebarLeft />
      <main className={styles.main}>
        <Header />
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
};

export default Layout;
