import {
  NavLink,
  useLocation,
} from "react-router";

import styles from "./styles.module.css";


type MobileNavigationProps = {
  onOpenMenu: () => void;
};


const navigationItems = [
  {
    label: "Home",
    to: "/home",
    icon: "⌂",
  },
  {
    label: "Calendário",
    to: "/calendar",
    icon: "🗓",
  },
  {
    label: "Movimentos",
    to: "/transactions",
    icon: "⇄",
  },
  {
    label: "Lume",
    to: "/lume",
    icon: "✦",
  },
];


const moreRoutes = [
  "/reports",
  "/planning",
  "/closings",
  "/accounts",
  "/categories",
  "/notifications",
  "/settings",
  "/admin",
];


export function MobileNavigation({
  onOpenMenu,
}: MobileNavigationProps) {
  const location =
    useLocation();

  const isMoreActive =
    moreRoutes.some(
      (route) =>
        location.pathname
          .startsWith(route),
    );


  return (
    <nav
      className={styles.navigation}
      aria-label="Navegação rápida"
    >
      {navigationItems.map(
        (item) => (
          <NavLink
            className={({
              isActive,
            }) =>
              [
                styles.item,
                isActive
                  ? styles.active
                  : "",
              ]
                .filter(Boolean)
                .join(" ")
            }
            key={item.to}
            to={item.to}
          >
            <span
              className={
                styles.icon
              }
            >
              {item.icon}
            </span>

            <span>
              {item.label}
            </span>
          </NavLink>
        ),
      )}

      <button
        type="button"
        className={[
          styles.item,
          isMoreActive
            ? styles.active
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={onOpenMenu}
        aria-label="Abrir menu completo"
      >
        <span
          className={
            styles.icon
          }
        >
          •••
        </span>

        <span>Mais</span>
      </button>
    </nav>
  );
}
