import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import SidebarNew from "./SidebarNew";
import Header from "./Header";
import MobileMenu, { HamburgerButton } from "./MobileMenu";
import FloatingActionButton from "./FloatingActionButton";
import styles from "./Layout.module.css";

const Layout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div>
      <SidebarNew />
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <main className={styles.main}>
        <Header>
          <HamburgerButton onClick={() => setMobileMenuOpen(true)} />
        </Header>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
      <FloatingActionButton />
    </div>
  );
};

export default Layout;
