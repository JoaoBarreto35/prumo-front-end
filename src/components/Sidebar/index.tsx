import { NavLink } from "react-router";

import styles from "./styles.module.css";

type SidebarProps = {
  isCollapsed: boolean;
  onToggle: () => void;
};

type NavigationItem = {
  label: string;
  to: string;
  icon: string;
};

type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

const navigationGroups: NavigationGroup[] = [
  {
    label: "Visão financeira",
    items: [
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
        label: "Fechamentos",
        to: "/closings",
        icon: "✓",
      },
    ],
  },
  {
    label: "Organização",
    items: [
      {
        label: "Contas",
        to: "/accounts",
        icon: "▣",
      },
      {
        label: "Categorias",
        to: "/categories",
        icon: "◇",
      },
    ],
  },
  {
    label: "Assistente",
    items: [
      {
        label: "Lume",
        to: "/lume",
        icon: "✦",
      },
    ],
  },
  {
    label: "Sistema",
    items: [
      {
        label: "Configurações",
        to: "/settings",
        icon: "⚙",
      },
      {
        label: "Usuários",
        to: "/admin/users",
        icon: "♙",
      },
    ],
  },
];

export function Sidebar({
  isCollapsed,
  onToggle,
}: SidebarProps) {
  return (
    <aside
      className={[
        styles.sidebar,
        isCollapsed ? styles.collapsed : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.brand}>
        <div className={styles.brandSymbol} aria-hidden="true">
          P
        </div>

        {!isCollapsed ? (
          <div className={styles.brandText}>
            <strong>Prumo</strong>
            <span>Aprumando sua vida financeira.</span>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        className={styles.toggleButton}
        onClick={onToggle}
        aria-label={
          isCollapsed
            ? "Expandir menu lateral"
            : "Recolher menu lateral"
        }
      >
        {isCollapsed ? "›" : "‹"}
      </button>

      <nav className={styles.navigation}>
        {navigationGroups.map((group) => (
          <div className={styles.group} key={group.label}>
            {!isCollapsed ? (
              <span className={styles.groupLabel}>
                {group.label}
              </span>
            ) : null}

            <div className={styles.groupItems}>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={isCollapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    [
                      styles.navigationItem,
                      isActive ? styles.active : "",
                    ]
                      .filter(Boolean)
                      .join(" ")
                  }
                >
                  <span
                    className={styles.itemIcon}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>

                  {!isCollapsed ? (
                    <span>{item.label}</span>
                  ) : null}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className={styles.userArea}>
        <div className={styles.avatar}>JB</div>

        {!isCollapsed ? (
          <div className={styles.userDetails}>
            <strong>João Barreto</strong>
            <span>Usuário</span>
          </div>
        ) : null}
      </div>
    </aside>
  );
}