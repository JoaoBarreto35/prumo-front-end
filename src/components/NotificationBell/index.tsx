import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router";

import { ApiError } from "../../services/api";
import {
  dispatchNotificationRefresh,
  notificationService,
} from "../../services/notificationService";
import type {
  AppNotification,
  NotificationPreferences,
} from "../../types/notifications";

import styles from "./styles.module.css";


const DISPLAYED_STORAGE_KEY =
  "prumo_browser_notification_ids";


function readDisplayedIds(): Set<string> {
  try {
    const stored = JSON.parse(
      localStorage.getItem(
        DISPLAYED_STORAGE_KEY,
      ) ?? "[]",
    );

    if (!Array.isArray(stored)) {
      return new Set();
    }

    return new Set(
      stored.filter(
        (item): item is string =>
          typeof item === "string",
      ),
    );
  } catch {
    return new Set();
  }
}


function saveDisplayedIds(
  ids: Set<string>,
) {
  localStorage.setItem(
    DISPLAYED_STORAGE_KEY,
    JSON.stringify(
      [...ids].slice(-200),
    ),
  );
}


function showNativeNotifications(
  notifications: AppNotification[],
  preferences: NotificationPreferences,
  navigate: (path: string) => void,
) {
  if (
    !preferences
      .browser_notifications_enabled
    || !("Notification" in window)
    || window.Notification.permission
      !== "granted"
  ) {
    return;
  }

  const displayed = readDisplayedIds();

  notifications
    .filter(
      (notification) =>
        !notification.read_at
        && !displayed.has(
          notification.id,
        ),
    )
    .forEach(
      (notification) => {
        const nativeNotification =
          new window.Notification(
            notification.title,
            {
              body: notification.message,
              tag: notification.id,
            },
          );

        nativeNotification.onclick =
          () => {
            window.focus();

            if (
              notification.action_path
            ) {
              navigate(
                notification.action_path,
              );
            } else {
              navigate(
                "/notifications",
              );
            }

            nativeNotification.close();
          };

        displayed.add(
          notification.id,
        );
      },
    );

  saveDisplayedIds(displayed);
}


function formatShortDate(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
    },
  ).format(new Date(value));
}


export function NotificationBell() {
  const navigate = useNavigate();
  const containerRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const [isOpen, setIsOpen] =
    useState(false);

  const [
    notifications,
    setNotifications,
  ] = useState<AppNotification[]>(
    [],
  );

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  const refresh = useCallback(
    async () => {
      try {
        const [
          notificationData,
          preferences,
        ] = await Promise.all([
          notificationService.list({
            limit: 6,
          }),
          notificationService
            .getPreferences(),
        ]);

        setNotifications(
          notificationData.items,
        );
        setUnreadCount(
          notificationData.unread_count,
        );
        setError("");

        showNativeNotifications(
          notificationData.items,
          preferences,
          navigate,
        );
      } catch (caughtError) {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "Não foi possível carregar as notificações.",
        );
      }
    },
    [navigate],
  );


  useEffect(() => {
    void refresh();

    const intervalId =
      window.setInterval(
        () => {
          if (
            document.visibilityState
            === "visible"
          ) {
            void refresh();
          }
        },
        60_000,
      );

    const handleRefresh = () => {
      void refresh();
    };

    const handleVisibility = () => {
      if (
        document.visibilityState
        === "visible"
      ) {
        void refresh();
      }
    };

    window.addEventListener(
      "prumo:notifications-refresh",
      handleRefresh,
    );
    document.addEventListener(
      "visibilitychange",
      handleVisibility,
    );

    return () => {
      window.clearInterval(
        intervalId,
      );
      window.removeEventListener(
        "prumo:notifications-refresh",
        handleRefresh,
      );
      document.removeEventListener(
        "visibilitychange",
        handleVisibility,
      );
    };
  }, [refresh]);


  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent,
    ) {
      if (
        containerRef.current
        && !containerRef.current
          .contains(
            event.target as Node,
          )
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);


  async function openNotification(
    notification: AppNotification,
  ) {
    setIsLoading(true);

    try {
      if (!notification.read_at) {
        await notificationService
          .markRead(
            notification.id,
          );
      }

      setIsOpen(false);
      dispatchNotificationRefresh();

      navigate(
        notification.action_path
        ?? "/notifications",
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível abrir a notificação.",
      );
    } finally {
      setIsLoading(false);
    }
  }


  async function markAllRead() {
    setIsLoading(true);

    try {
      await notificationService
        .markAllRead();

      await refresh();
      dispatchNotificationRefresh();
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <div
      className={styles.container}
      ref={containerRef}
    >
      <button
        type="button"
        className={styles.bellButton}
        aria-label={
          unreadCount > 0
            ? `${unreadCount} notificações não lidas`
            : "Notificações"
        }
        aria-expanded={isOpen}
        onClick={() =>
          setIsOpen(
            (current) => !current,
          )
        }
      >
        <span aria-hidden="true">
        🔔
        </span>

        {unreadCount > 0 ? (
          <strong>
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </strong>
        ) : null}
      </button>

      {isOpen ? (
        <div
          className={styles.popover}
        >
          <div
            className={
              styles.popoverHeader
            }
          >
            <div>
              <strong>
                Notificações
              </strong>

              <span>
                {unreadCount} não lidas
              </span>
            </div>

            {unreadCount > 0 ? (
              <button
                type="button"
                disabled={isLoading}
                onClick={() =>
                  void markAllRead()
                }
              >
                Ler todas
              </button>
            ) : null}
          </div>

          {error ? (
            <p
              className={styles.error}
            >
              {error}
            </p>
          ) : notifications.length
            === 0 ? (
            <div
              className={styles.empty}
            >
              <span>✓</span>
              <strong>
                Tudo em ordem
              </strong>
              <p>
                Nenhum lembrete precisa
                da sua atenção agora.
              </p>
            </div>
          ) : (
            <div
              className={
                styles.notificationList
              }
            >
              {notifications.map(
                (notification) => (
                  <button
                    type="button"
                    key={notification.id}
                    className={[
                      styles.notification,
                      !notification.read_at
                        ? styles.unread
                        : "",
                      styles[
                        notification
                          .severity
                      ],
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    disabled={isLoading}
                    onClick={() =>
                      void openNotification(
                        notification,
                      )
                    }
                  >
                    <span
                      className={
                        styles.indicator
                      }
                    />

                    <span
                      className={
                        styles.notificationText
                      }
                    >
                      <strong>
                        {notification.title}
                      </strong>

                      <small>
                        {
                          notification
                            .message
                        }
                      </small>

                      <time>
                        {formatShortDate(
                          notification
                            .created_at,
                        )}
                      </time>
                    </span>
                  </button>
                ),
              )}
            </div>
          )}

          <button
            type="button"
            className={styles.viewAll}
            onClick={() => {
              setIsOpen(false);
              navigate(
                "/notifications",
              );
            }}
          >
            Abrir central de notificações
          </button>
        </div>
      ) : null}
    </div>
  );
}
