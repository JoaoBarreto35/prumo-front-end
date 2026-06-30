import { NavLink } from "react-router";

import styles from "./styles.module.css";


const navigationItems = [
  { label: "Home", to: "/home", icon: "⌂" },
  { label: "Calendário", to: "/calendar", icon: "▦" },
  { label: "Planejar", to: "/planning", icon: "↗" },
  { label: "Movimentos", to: "/transactions", icon: "⇄" },
  { label: "Mais", to: "/settings", icon: "•••" },
];


export function MobileNavigation() {
  return (
    <nav className={styles.navigation}>
      {navigationItems.map((item) => (
        <NavLink
          className={({ isActive }) => [
            styles.item,
            isActive ? styles.active : "",
          ].filter(Boolean).join(" ")}
          key={item.to}
          to={item.to}
        >
          <span className={styles.icon}>{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
