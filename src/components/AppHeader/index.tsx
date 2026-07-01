import {
  useLocation,
} from "react-router";

import {
  useTheme,
} from "../../contexts/ThemeContext";
import { Button } from "../Button";
import {
  NotificationBell,
} from "../NotificationBell";
import {
  UserMenu,
} from "../UserMenu";

import styles from "./styles.module.css";


type AppHeaderProps = {
  onOpenNavigation: () => void;
};


const routeTitles:
  Record<string, string> = {
  "/home": "Home",
  "/calendar": "Calendário",
  "/transactions":
    "Movimentações",
  "/closings": "Fechamentos",
  "/accounts": "Contas",
  "/categories": "Categorias",
  "/reports": "Relatórios",
  "/planning": "Planejamento",
  "/lume": "Lume",
  "/notifications":
    "Notificações",
  "/settings":
    "Configurações",
  "/settings/profile":
    "Perfil",
  "/settings/preferences":
    "Preferências",
  "/settings/security":
    "Segurança",
  "/settings/appearance":
    "Aparência",
  "/admin/users":
    "Administração",
  "/settings/data":
    "Dados e backup",

};


function getPageTitle(
  pathname: string,
): string {
  const exactTitle =
    routeTitles[pathname];

  if (exactTitle) {
    return exactTitle;
  }

  const matchingRoute =
    Object.entries(
      routeTitles,
    ).find(
      ([route]) =>
        pathname.startsWith(
          `${route}/`,
        ),
    );

  return (
    matchingRoute?.[1]
    ?? "Prumo"
  );
}


export function AppHeader({
  onOpenNavigation,
}: AppHeaderProps) {
  const location =
    useLocation();

  const {
    resolvedTheme,
    setTheme,
  } = useTheme();

  const title = getPageTitle(
    location.pathname,
  );


  function toggleTheme() {
    setTheme(
      resolvedTheme === "dark"
        ? "light"
        : "dark",
    );
  }


  return (
    <header
      className={styles.header}
    >
      <div
        className={
          styles.leftArea
        }
      >
        <button
          type="button"
          className={
            styles.mobileMenuButton
          }
          onClick={
            onOpenNavigation
          }
          aria-label="Abrir menu principal"
          aria-haspopup="dialog"
        >
          <span aria-hidden="true">
            ☰
          </span>
        </button>

        <div
          className={
            styles.titleArea
          }
        >
          <span
            className={
              styles.mobileBrand
            }
          >
            Prumo
          </span>

          <strong>{title}</strong>
        </div>
      </div>

      <div
        className={styles.actions}
      >
        <NotificationBell />

        <Button
          variant="secondary"
          size="small"
          onClick={toggleTheme}
        >
          <span
            className={
              styles.themeFullLabel
            }
          >
            {resolvedTheme
              === "dark"
              ? "Claro"
              : "Escuro"}
          </span>

          <span
            className={
              styles.themeShortLabel
            }
            aria-hidden="true"
          >
            {resolvedTheme
              === "dark"
              ? "☀"
              : "◐"}
          </span>
        </Button>

        <UserMenu />
      </div>
    </header>
  );
}
