import { useEffect, useState } from "react";
import { Outlet } from "react-router";

import { AppHeader } from "../../components/AppHeader";
import { LumeLauncher } from "../../components/LumeLauncher";
import { MobileNavigation } from "../../components/MobileNavigation";
import { Sidebar } from "../../components/Sidebar";

import styles from "./styles.module.css";

const SIDEBAR_STORAGE_KEY = "prumo-sidebar-collapsed";

export function AppLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  });

  function toggleSidebar() {
    setIsSidebarCollapsed((currentState) => !currentState);
  }

  useEffect(() => {
    localStorage.setItem(
      SIDEBAR_STORAGE_KEY,
      String(isSidebarCollapsed),
    );
  }, [isSidebarCollapsed]);

  return (
    <div
      className={[
        styles.layout,
        isSidebarCollapsed ? styles.sidebarCollapsed : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={toggleSidebar}
      />

      <div className={styles.contentArea}>
        <AppHeader onOpenNavigation={toggleSidebar} />

        <main className={styles.mainContent}>
          <Outlet />
        </main>
      </div>

      <MobileNavigation />
      <LumeLauncher />
    </div>
  );
}