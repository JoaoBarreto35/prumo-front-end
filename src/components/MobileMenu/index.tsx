import {
  useEffect,
  useRef,
} from "react";
import {
  NavLink,
  useLocation,
  useNavigate,
} from "react-router";

import {
  getNavigationGroups,
} from "../../config/navigation";
import {
  useAuth,
} from "../../contexts/AuthContext";
import {
  getUserDisplayName,
  getUserInitials,
  getUserRoleLabel,
} from "../../utils/userPresentation";

import styles from "./styles.module.css";


type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};


export function MobileMenu({
  isOpen,
  onClose,
}: MobileMenuProps) {
  const location =
    useLocation();
  const navigate =
    useNavigate();

  const closeButtonRef =
    useRef<
      HTMLButtonElement | null
    >(null);

  const {
    user,
    logout,
  } = useAuth();

  const groups =
    getNavigationGroups(
      user?.role,
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

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style
      .overflow = "hidden";

    window.requestAnimationFrame(
      () =>
        closeButtonRef.current
          ?.focus(),
    );

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape"
      ) {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style
        .overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    isOpen,
    onClose,
  ]);


  useEffect(() => {
    onClose();
  }, [
    location.pathname,
    onClose,
  ]);


  async function handleLogout() {
    await logout();
    onClose();

    navigate(
      "/login",
      {
        replace: true,
      },
    );
  }


  if (!isOpen) {
    return null;
  }


  return (
    <div
      className={styles.layer}
      role="presentation"
    >
      <button
        type="button"
        className={
          styles.backdrop
        }
        aria-label="Fechar menu"
        onClick={onClose}
      />

      <aside
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal"
      >
        <header
          className={
            styles.drawerHeader
          }
        >
          <div
            className={
              styles.brand
            }
          >
            <span>P</span>

            <div>
              <strong>Prumo</strong>
              <small>
                Menu principal
              </small>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            className={
              styles.closeButton
            }
            aria-label="Fechar menu"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <NavLink
          to="/settings/profile"
          className={
            styles.userCard
          }
        >
          <span
            className={
              styles.avatar
            }
          >
            {initials}
          </span>

          <span
            className={
              styles.userText
            }
          >
            <strong>{name}</strong>
            <small>
              {role} · {user?.email}
            </small>
          </span>

          <span
            aria-hidden="true"
          >
            ›
          </span>
        </NavLink>

        <nav
          className={
            styles.navigation
          }
        >
          {groups.map(
            (group) => (
              <section
                key={group.label}
                className={
                  styles.group
                }
              >
                <span
                  className={
                    styles.groupLabel
                  }
                >
                  {group.label}
                </span>

                <div
                  className={
                    styles.groupItems
                  }
                >
                  {group.items.map(
                    (item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({
                          isActive,
                        }) =>
                          [
                            styles.item,
                            isActive
                              ? styles.active
                              : "",
                          ]
                            .filter(
                              Boolean,
                            )
                            .join(" ")
                        }
                      >
                        <span
                          className={
                            styles.itemIcon
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
                </div>
              </section>
            ),
          )}
        </nav>

        <footer
          className={
            styles.footer
          }
        >
          <button
            type="button"
            onClick={() =>
              void handleLogout()
            }
          >
            <span
              aria-hidden="true"
            >
              ⇥
            </span>
            Sair da conta
          </button>
        </footer>
      </aside>
    </div>
  );
}
