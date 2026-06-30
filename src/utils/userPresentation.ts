import type {
  AuthUser,
  UserRole,
} from "../types/auth";


export function getUserInitials(
  name: string | null | undefined,
): string {
  const normalized =
    name?.trim() ?? "";

  if (!normalized) {
    return "U";
  }

  return normalized
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0),
    )
    .join("")
    .toLocaleUpperCase("pt-BR");
}


export function getUserRoleLabel(
  role: UserRole | null | undefined,
): string {
  return role === "admin"
    ? "Administrador"
    : "Usuário";
}


export function getUserDisplayName(
  user: AuthUser | null,
): string {
  return user?.name?.trim()
    || "Usuário";
}
