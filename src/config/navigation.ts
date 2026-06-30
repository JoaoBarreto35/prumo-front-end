import type {
  UserRole,
} from "../types/auth";


export type NavigationItem = {
  label: string;
  to: string;
  icon: string;
  role?: UserRole;
};


export type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};


export const navigationGroups:
  NavigationGroup[] = [
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
          icon: "🗓",
        },
        {
          label: "Relatórios",
          to: "/reports",
          icon: "🗠",
        },
        {
          label: "Planejamento",
          to: "/planning",
          icon: "↗",
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
          label: "Notificações",
          to: "/notifications",
          icon: "♢",
        },
        {
          label: "Configurações",
          to: "/settings/profile",
          icon: "⚙",
        },
        {
          label: "Usuários",
          to: "/admin/users",
          icon: "♙",
          role: "admin",
        },
      ],
    },
  ];


export function getNavigationGroups(
  role: UserRole | null | undefined,
): NavigationGroup[] {
  return navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          !item.role
          || item.role === role,
      ),
    }))
    .filter(
      (group) =>
        group.items.length > 0,
    );
}
