import { NavLink } from "react-router";

import styles from "./styles.module.css";

const navigationItems = [
  {
    label: "Home",
    to: "/home",
    icon: "⌂",
  },
  {
    label: "Calendário",
    to: "/calendar",
    icon: "▦",
  },
  {
    label: "Movimentações",
    to: "/transactions",
    icon: "⇄",
  },
  {
    label: "Mais",
    to: "/settings",
    icon: "•••",
  },
];

export function MobileNavigation() {
  return (
    <nav
      className={styles.navigation}
      aria-label="Navegação principal"
    >
      {navigationItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            [
              styles.item,
              isActive ? styles.active : "",
            ]
              .filter(Boolean)
              .join(" ")
          }
        >
          <span className={styles.icon} aria-hidden="true">
            {item.icon}
          </span>

          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}