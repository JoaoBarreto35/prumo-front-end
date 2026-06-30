import {
  useEffect,
  useState,
} from "react";
import {
  useLocation,
} from "react-router";

import styles from "./styles.module.css";


function resolveTitle(
  pathname: string,
): string {
  const routeTitles:
    Record<string, string> = {
      "/home": "Home",
      "/calendar": "Calendário",
      "/transactions":
        "Movimentações",
      "/transactions/new":
        "Nova movimentação",
      "/planning":
        "Planejamento",
      "/reports": "Relatórios",
      "/lume": "Lume",
      "/notifications":
        "Notificações",
      "/settings/profile":
        "Perfil",
      "/settings/preferences":
        "Preferências",
      "/settings/security":
        "Segurança",
      "/settings/appearance":
        "Aparência",
    };

  if (
    routeTitles[pathname]
  ) {
    return routeTitles[pathname];
  }

  if (
    pathname.startsWith(
      "/transactions/",
    )
  ) {
    return "Detalhes da movimentação";
  }

  if (
    pathname.startsWith(
      "/admin",
    )
  ) {
    return "Administração";
  }

  return "Prumo";
}


export function RouteAnnouncer() {
  const location = useLocation();

  const [
    announcement,
    setAnnouncement,
  ] = useState("");


  useEffect(() => {
    const title = resolveTitle(
      location.pathname,
    );

    document.title =
      `${title} | Prumo`;

    setAnnouncement(
      `Página carregada: ${title}`,
    );

    const main =
      document.getElementById(
        "main-content",
      );

    if (main) {
      main.setAttribute(
        "tabindex",
        "-1",
      );

      window.requestAnimationFrame(
        () => main.focus({
          preventScroll: true,
        }),
      );
    }
  }, [
    location.pathname,
    location.search,
  ]);


  return (
    <span
      className={styles.srOnly}
      aria-live="polite"
      aria-atomic="true"
    >
      {announcement}
    </span>
  );
}
