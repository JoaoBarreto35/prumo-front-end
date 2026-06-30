import { useLocation } from "react-router";

import { Button } from "../Button";
import { useTheme } from "../../contexts/ThemeContext";
import { NotificationBell } from "../NotificationBell";

import styles from "./styles.module.css";

type AppHeaderProps = {
  onOpenNavigation: () => void;
};

const routeTitles: Record<string, string> = {
  "/home": "Home",
  "/calendar": "Calendário",
  "/transactions": "Movimentações",
  "/closings": "Fechamentos",
  "/accounts": "Contas",
  "/categories": "Categorias",
  "/lume": "Lume",
  "/settings": "Configurações",
  "/admin/users": "Administração",
  "/notifications": "Notificações",
};

function getPageTitle(pathname: string): string {
  const exactTitle = routeTitles[pathname];

  if (exactTitle) {
    return exactTitle;
  }

  const matchingRoute = Object.entries(routeTitles).find(
    ([route]) => pathname.startsWith(`${route}/`),
  );

  return matchingRoute?.[1] ?? "Prumo";
}

export function AppHeader({
  onOpenNavigation,
}: AppHeaderProps) {
  const location = useLocation();
  const { resolvedTheme, setTheme } = useTheme();

  const title = getPageTitle(location.pathname);

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  return (
    <header className={styles.header}>
      <button
        type="button"
        className={styles.mobileMenuButton}
        onClick={onOpenNavigation}
        aria-label="Abrir navegação"
      >
        ☰
      </button>

      <div className={styles.titleArea}>
        <span className={styles.mobileBrand}>Prumo</span>
        <strong>{title}</strong>
      </div>

      <div className={styles.actions}>
        <NotificationBell />
        <Button
          variant="secondary"
          size="small"
          onClick={toggleTheme}
        >
          {resolvedTheme === "dark" ? "Claro" : "Escuro"}
        </Button>

        <button
          type="button"
          className={styles.profileButton}
          aria-label="Abrir menu do perfil"
        >
          JB
        </button>
      </div>
    </header>
  );
}