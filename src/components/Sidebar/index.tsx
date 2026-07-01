import {
  NavLink,
} from "react-router";

import {
  getNavigationGroups,
} from "../../config/navigation";
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


type SidebarProps = {
  isCollapsed: boolean;
  onToggle: () => void;
};


export function Sidebar({
  isCollapsed,
  onToggle,
}: SidebarProps) {
  const {
    user,
  } = useAuth();

  const {
    isLoggingOut,
    performLogout,
  } = useAppLogout();

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

  const roleLabel =
    getUserRoleLabel(
      user?.role,
    );


  return (
    <aside
      className={[
        styles.sidebar,
        isCollapsed
          ? styles.collapsed
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={styles.brand}
      >
        <div
          className={
            styles.brandSymbol
          }
        >
          P
        </div>

        {!isCollapsed ? (
          <div
            className={
              styles.brandText
            }
          >
            <strong>Prumo</strong>
            <span>
              Aprumando sua vida
              financeira.
            </span>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        className={
          styles.toggleButton
        }
        onClick={onToggle}
        aria-label={
          isCollapsed
            ? "Expandir menu"
            : "Recolher menu"
        }
      >
        {isCollapsed
          ? "›"
          : "‹"}
      </button>

      <nav
        className={
          styles.navigation
        }
        aria-label="Menu principal"
      >
        {groups.map(
          (group) => (
            <section
              className={
                styles.group
              }
              key={group.label}
            >
              {!isCollapsed ? (
                <span
                  className={
                    styles.groupLabel
                  }
                >
                  {group.label}
                </span>
              ) : null}

              <div
                className={
                  styles.groupItems
                }
              >
                {group.items.map(
                  (item) => (
                    <NavLink
                      className={({
                        isActive,
                      }) =>
                        [
                          styles
                            .navigationItem,
                          isActive
                            ? styles.active
                            : "",
                        ]
                          .filter(
                            Boolean,
                          )
                          .join(" ")
                      }
                      key={item.to}
                      to={item.to}
                      title={
                        isCollapsed
                          ? item.label
                          : undefined
                      }
                    >
                      <span
                        className={
                          styles.itemIcon
                        }
                      >
                        {item.icon}
                      </span>

                      {!isCollapsed ? (
                        <span>
                          {item.label}
                        </span>
                      ) : null}
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
          styles.sidebarFooter
        }
      >
        <NavLink
          to="/settings/profile"
          className={
            styles.userArea
          }
          title={
            isCollapsed
              ? name
              : undefined
          }
        >
          <div
            className={
              styles.avatar
            }
          >
            {initials}
          </div>

          {!isCollapsed ? (
            <div
              className={
                styles.userDetails
              }
            >
              <strong>
                {name}
              </strong>
              <span>
                {roleLabel}
              </span>
            </div>
          ) : null}
        </NavLink>

        <button
          type="button"
          className={
            styles.logoutButton
          }
          title={
            isCollapsed
              ? "Sair da conta"
              : undefined
          }
          aria-label="Sair da conta"
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

          {!isCollapsed ? (
            <span>
              {isLoggingOut
                ? "Saindo..."
                : "Sair da conta"}
            </span>
          ) : null}
        </button>
      </footer>
    </aside>
  );
}
