import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Outlet,
} from "react-router";

import {
  AppHeader,
} from "../../components/AppHeader";
import {
  LumeLauncher,
} from "../../components/LumeLauncher";
import {
  MobileMenu,
} from "../../components/MobileMenu";
import {
  MobileNavigation,
} from "../../components/MobileNavigation";
import {
  PreferencesBootstrap,
} from "../../components/PreferencesBootstrap";
import {
  RouteAnnouncer,
} from "../../components/RouteAnnouncer";
import {
  Sidebar,
} from "../../components/Sidebar";

import styles from "./styles.module.css";


const SIDEBAR_STORAGE_KEY =
  "prumo-sidebar-collapsed";


export function AppLayout() {
  const [
    isSidebarCollapsed,
    setIsSidebarCollapsed,
  ] = useState(() => {
    return (
      localStorage.getItem(
        SIDEBAR_STORAGE_KEY,
      ) === "true"
    );
  });

  const [
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  ] = useState(false);


  function toggleSidebar() {
    setIsSidebarCollapsed(
      (currentState) =>
        !currentState,
    );
  }


  const openMobileMenu =
    useCallback(() => {
      setIsMobileMenuOpen(true);
    }, []);


  const closeMobileMenu =
    useCallback(() => {
      setIsMobileMenuOpen(false);
    }, []);


  useEffect(() => {
    localStorage.setItem(
      SIDEBAR_STORAGE_KEY,
      String(
        isSidebarCollapsed,
      ),
    );
  }, [isSidebarCollapsed]);


  useEffect(() => {
    const mediaQuery =
      window.matchMedia(
        "(min-width: 1025px)",
      );

    function handleChange(
      event:
        MediaQueryListEvent,
    ) {
      if (event.matches) {
        closeMobileMenu();
      }
    }

    mediaQuery.addEventListener(
      "change",
      handleChange,
    );

    return () => {
      mediaQuery
        .removeEventListener(
          "change",
          handleChange,
        );
    };
  }, [closeMobileMenu]);


  return (
    <>
      <PreferencesBootstrap />

      <a
        className="skipLink"
        href="#main-content"
      >
        Ir para o conteúdo
      </a>

      <RouteAnnouncer />

      <div
        className={[
          styles.layout,
          isSidebarCollapsed
            ? styles
                .sidebarCollapsed
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <Sidebar
          isCollapsed={
            isSidebarCollapsed
          }
          onToggle={
            toggleSidebar
          }
        />

        <div
          className={
            styles.contentArea
          }
        >
          <AppHeader
            onOpenNavigation={
              openMobileMenu
            }
          />

          <main
            className={
              styles.mainContent
            }
            id="main-content"
          >
            <Outlet />
          </main>
        </div>

        <MobileNavigation
          onOpenMenu={
            openMobileMenu
          }
        />

        <MobileMenu
          isOpen={
            isMobileMenuOpen
          }
          onClose={
            closeMobileMenu
          }
        />

        <LumeLauncher />
      </div>
    </>
  );
}
