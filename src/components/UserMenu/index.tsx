import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  NavLink,
} from "react-router";

import {
  useAuth,
} from "../../contexts/AuthContext";
import {
  useAppLogout,
} from "../../hooks/useAppLogout";
import {
  getUserDisplayName,
  getUserInitials,
  getUserRoleLabel,
} from "../../utils/userPresentation";

import styles from "./styles.module.css";


export function UserMenu() {
  const {
    user,
  } = useAuth();

  const {
    isLoggingOut,
    performLogout,
  } = useAppLogout();

  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const containerRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const buttonRef =
    useRef<HTMLButtonElement | null>(
      null,
    );


  const name =
    getUserDisplayName(user);

  const initials =
    getUserInitials(
      user?.name,
    );

  const role =
    getUserRoleLabel(
      user?.role,
    );


  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(
      event: MouseEvent,
    ) {
      const target =
        event.target as Node;

      if (
        !containerRef.current
          ?.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape"
      ) {
        setIsOpen(false);
        buttonRef.current
          ?.focus();
      }
    }

    document.addEventListener(
      "mousedown",
      handlePointerDown,
    );

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown,
      );

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [isOpen]);


  return (
    <div
      ref={containerRef}
      className={styles.container}
    >
      <button
        ref={buttonRef}
        type="button"
        className={
          styles.trigger
        }
        aria-label={
          `Abrir menu de ${name}`
        }
        aria-expanded={isOpen}
        aria-haspopup="menu"
        title={name}
        onClick={() =>
          setIsOpen(
            (current) =>
              !current,
          )
        }
      >
        {initials}
      </button>

      {isOpen ? (
        <div
          className={
            styles.menu
          }
          role="menu"
        >
          <header
            className={
              styles.identity
            }
          >
            <span
              className={
                styles.avatar
              }
            >
              {initials}
            </span>

            <span>
              <strong>{name}</strong>
              <small>
                {role}
                {user?.email
                  ? ` · ${user.email}`
                  : ""}
              </small>
            </span>
          </header>

          <nav
            className={
              styles.links
            }
          >
            <NavLink
              to="/settings/profile"
              role="menuitem"
              onClick={() =>
                setIsOpen(false)
              }
            >
              <span
                aria-hidden="true"
              >
                ♙
              </span>
              Perfil
            </NavLink>

            <NavLink
              to="/settings/security"
              role="menuitem"
              onClick={() =>
                setIsOpen(false)
              }
            >
              <span
                aria-hidden="true"
              >
                ◈
              </span>
              Segurança
            </NavLink>
          </nav>

          <button
            type="button"
            className={
              styles.logout
            }
            role="menuitem"
            disabled={isLoggingOut}
            onClick={() =>
              void performLogout()
            }
          >
            <span
              aria-hidden="true"
            >
              ⇥
            </span>

            {isLoggingOut
              ? "Saindo..."
              : "Sair da conta"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
