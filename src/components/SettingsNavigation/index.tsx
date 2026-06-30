import { NavLink } from "react-router";

import styles from "./styles.module.css";


const items = [
  {
    to: "/settings/profile",
    label: "Perfil",
    description:
      "Nome e informações da conta",
    icon: "◉",
  },
  {
    to: "/settings/preferences",
    label: "Preferências",
    description:
      "Página inicial e comportamento",
    icon: "⌘",
  },
  {
    to: "/settings/security",
    label: "Segurança",
    description:
      "Senha e sessões ativas",
    icon: "◇",
  },
  {
    to: "/settings/appearance",
    label: "Aparência",
    description:
      "Tema, densidade e movimento",
    icon: "◐",
  },
];


export function SettingsNavigation() {
  return (
    <nav
      className={styles.navigation}
      aria-label="Configurações"
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            [
              styles.item,
              isActive
                ? styles.active
                : "",
            ]
              .filter(Boolean)
              .join(" ")
          }
        >
          <span
            className={styles.icon}
            aria-hidden="true"
          >
            {item.icon}
          </span>

          <span
            className={styles.text}
          >
            <strong>
              {item.label}
            </strong>

            <small>
              {item.description}
            </small>
          </span>
        </NavLink>
      ))}
    </nav>
  );
}
