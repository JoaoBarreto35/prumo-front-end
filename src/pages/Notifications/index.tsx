import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { PageState } from "../../components/PageState";
import { ApiError } from "../../services/api";
import {
  dispatchNotificationRefresh,
  notificationService,
} from "../../services/notificationService";
import type {
  AppNotification,
  NotificationPreferences,
  NotificationSeverity,
} from "../../types/notifications";

import styles from "./styles.module.css";


const reminderDayOptions = [
  1,
  2,
  3,
  5,
  7,
  15,
];


function formatDateTime(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(new Date(value));
}


function severityLabel(
  severity: NotificationSeverity,
): string {
  if (severity === "danger") {
    return "Urgente";
  }

  if (severity === "warning") {
    return "Atenção";
  }

  if (severity === "success") {
    return "Concluído";
  }

  return "Informação";
}


export function NotificationsPage() {
  const navigate = useNavigate();

  const [
    notifications,
    setNotifications,
  ] = useState<AppNotification[]>(
    [],
  );

  const [
    preferences,
    setPreferences,
  ] = useState<
    NotificationPreferences | null
  >(null);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [
    unreadOnly,
    setUnreadOnly,
  ] = useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [
    runningNotificationId,
    setRunningNotificationId,
  ] = useState<string | null>(
    null,
  );

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  const loadData = useCallback(
    async () => {
      setIsLoading(true);
      setError("");

      try {
        const [
          notificationData,
          preferenceData,
        ] = await Promise.all([
          notificationService.list({
            unreadOnly,
            limit: 100,
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
        setPreferences(
          preferenceData,
        );
      } catch (caughtError) {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "Não foi possível carregar as notificações.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [unreadOnly],
  );


  useEffect(() => {
    void loadData();
  }, [loadData]);


  const unreadNotifications =
    useMemo(
      () =>
        notifications.filter(
          (notification) =>
            !notification.read_at,
        ),
      [notifications],
    );


  async function openNotification(
    notification: AppNotification,
  ) {
    setRunningNotificationId(
      notification.id,
    );

    try {
      if (!notification.read_at) {
        await notificationService
          .markRead(
            notification.id,
          );
      }

      dispatchNotificationRefresh();

      if (notification.action_path) {
        navigate(
          notification.action_path,
        );
      } else {
        await loadData();
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível abrir a notificação.",
      );
    } finally {
      setRunningNotificationId(
        null,
      );
    }
  }


  async function markAllRead() {
    setIsSaving(true);

    try {
      await notificationService
        .markAllRead();

      dispatchNotificationRefresh();
      await loadData();
    } finally {
      setIsSaving(false);
    }
  }


  async function snooze(
    notification: AppNotification,
  ) {
    setRunningNotificationId(
      notification.id,
    );

    try {
      await notificationService
        .snooze(
          notification.id,
          1,
        );

      setSuccess(
        "O lembrete voltará amanhã.",
      );
      dispatchNotificationRefresh();
      await loadData();
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível adiar o lembrete.",
      );
    } finally {
      setRunningNotificationId(
        null,
      );
    }
  }


  async function dismiss(
    notification: AppNotification,
  ) {
    setRunningNotificationId(
      notification.id,
    );

    try {
      await notificationService
        .dismiss(
          notification.id,
        );

      dispatchNotificationRefresh();
      await loadData();
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível remover a notificação.",
      );
    } finally {
      setRunningNotificationId(
        null,
      );
    }
  }


  function toggleReminderDay(
    day: number,
  ) {
    setPreferences(
      (current) => {
        if (!current) {
          return current;
        }

        const alreadySelected =
          current.reminder_days
            .includes(day);

        return {
          ...current,
          reminder_days:
            alreadySelected
              ? current.reminder_days
                  .filter(
                    (item) =>
                      item !== day,
                  )
              : [
                  ...current
                    .reminder_days,
                  day,
                ].sort(
                  (a, b) => a - b,
                ),
        };
      },
    );
  }


  async function requestBrowserPermission() {
    if (
      !("Notification" in window)
    ) {
      setError(
        "Este navegador não oferece notificações nativas.",
      );
      return;
    }

    const permission =
      await window.Notification
        .requestPermission();

    setPreferences(
      (current) =>
        current
          ? {
              ...current,
              browser_notifications_enabled:
                permission
                === "granted",
            }
          : current,
    );

    if (permission !== "granted") {
      setError(
        "A permissão não foi concedida pelo navegador.",
      );
    } else {
      setSuccess(
        "Notificações do navegador ativadas.",
      );
    }
  }


  async function savePreferences() {
    if (!preferences) {
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const updated =
        await notificationService
          .updatePreferences(
            preferences,
          );

      setPreferences(updated);
      setSuccess(
        "Preferências salvas.",
      );
      dispatchNotificationRefresh();
      await loadData();
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível salvar as preferências.",
      );
    } finally {
      setIsSaving(false);
    }
  }


  return (
    <div className={styles.page}>
      <header
        className={styles.pageHeader}
      >
        <div>
          <span className={styles.eyebrow}>
            Prazos e atenção
          </span>

          <h1>Notificações</h1>

          <p>
            Acompanhe vencimentos,
            atrasos e escolha quando
            o Prumo deve lembrar você.
          </p>
        </div>

        <Button
          variant="secondary"
          disabled={
            unreadCount === 0
            || isSaving
          }
          onClick={() =>
            void markAllRead()
          }
        >
          Marcar tudo como lido
        </Button>
      </header>

      {error ? (
        <div className={styles.error}>
          {error}
        </div>
      ) : null}

      {success ? (
        <div
          className={styles.success}
        >
          {success}
        </div>
      ) : null}

      <section
        className={
          styles.summaryGrid
        }
      >
        <Card>
          <div className={styles.metric}>
            <span>Não lidas</span>
            <strong>{unreadCount}</strong>
          </div>
        </Card>

        <Card>
          <div className={styles.metric}>
            <span>
              Exibidas agora
            </span>
            <strong>
              {notifications.length}
            </strong>
          </div>
        </Card>

        <Card>
          <div className={styles.metric}>
            <span>
              Precisam de atenção
            </span>
            <strong
              className={
                unreadNotifications.some(
                  (notification) =>
                    notification.severity
                    === "danger",
                )
                  ? styles.dangerText
                  : ""
              }
            >
              {
                unreadNotifications
                  .filter(
                    (notification) =>
                      notification
                        .severity
                      === "danger",
                  )
                  .length
              }
            </strong>
          </div>
        </Card>
      </section>

      <section
        className={
          styles.contentGrid
        }
      >
        <Card
          title="Central"
          description={
            "Lembretes gerados a partir "
            + "das movimentações pendentes."
          }
        >
          <div
            className={styles.tabs}
          >
            <button
              type="button"
              className={
                !unreadOnly
                  ? styles.tabActive
                  : ""
              }
              onClick={() =>
                setUnreadOnly(false)
              }
            >
              Todas
            </button>

            <button
              type="button"
              className={
                unreadOnly
                  ? styles.tabActive
                  : ""
              }
              onClick={() =>
                setUnreadOnly(true)
              }
            >
              Não lidas
            </button>
          </div>

          {isLoading ? (
            <PageState
              title="Atualizando lembretes"
              description="Conferindo seus próximos vencimentos."
            />
          ) : notifications.length
          === 0 ? (
            <PageState
              title="Nada precisa da sua atenção"
              description={
                unreadOnly
                  ? "Você não possui notificações não lidas."
                  : "Os próximos lembretes aparecerão aqui."
              }
            />
          ) : (
            <div
              className={
                styles.notificationList
              }
            >
              {notifications.map(
                (notification) => {
                  const isRunning =
                    runningNotificationId
                    === notification.id;

                  return (
                    <article
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
                      key={notification.id}
                    >
                      <span
                        className={
                          styles.indicator
                        }
                      />

                      <div
                        className={
                          styles.notificationBody
                        }
                      >
                        <div
                          className={
                            styles.notificationHeader
                          }
                        >
                          <div>
                            <strong>
                              {
                                notification
                                  .title
                              }
                            </strong>

                            <span>
                              {severityLabel(
                                notification
                                  .severity,
                              )}
                            </span>
                          </div>

                          <time>
                            {formatDateTime(
                              notification
                                .created_at,
                            )}
                          </time>
                        </div>

                        <p>
                          {
                            notification
                              .message
                          }
                        </p>

                        <div
                          className={
                            styles.notificationActions
                          }
                        >
                          <Button
                            size="small"
                            disabled={isRunning}
                            onClick={() =>
                              void openNotification(
                                notification,
                              )
                            }
                          >
                            Abrir
                          </Button>

                          <Button
                            size="small"
                            variant="tertiary"
                            disabled={isRunning}
                            onClick={() =>
                              void snooze(
                                notification,
                              )
                            }
                          >
                            Lembrar amanhã
                          </Button>

                          <Button
                            size="small"
                            variant="tertiary"
                            disabled={isRunning}
                            onClick={() =>
                              void dismiss(
                                notification,
                              )
                            }
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          )}
        </Card>

        <Card
          title="Preferências"
          description={
            "Defina quais lembretes "
            + "devem aparecer."
          }
        >
          {preferences ? (
            <div
              className={
                styles.preferences
              }
            >
              <label
                className={
                  styles.toggleRow
                }
              >
                <span>
                  <strong>
                    Vencimentos próximos
                  </strong>
                  <small>
                    Avisar antes da data.
                  </small>
                </span>

                <input
                  type="checkbox"
                  checked={
                    preferences
                      .due_soon_enabled
                  }
                  onChange={(event) =>
                    setPreferences({
                      ...preferences,
                      due_soon_enabled:
                        event.target
                          .checked,
                    })
                  }
                />
              </label>

              <label
                className={
                  styles.toggleRow
                }
              >
                <span>
                  <strong>
                    Vencimentos de hoje
                  </strong>
                  <small>
                    Destacar o que vence
                    no dia.
                  </small>
                </span>

                <input
                  type="checkbox"
                  checked={
                    preferences
                      .due_today_enabled
                  }
                  onChange={(event) =>
                    setPreferences({
                      ...preferences,
                      due_today_enabled:
                        event.target
                          .checked,
                    })
                  }
                />
              </label>

              <label
                className={
                  styles.toggleRow
                }
              >
                <span>
                  <strong>Atrasos</strong>
                  <small>
                    Manter pendências
                    vencidas em destaque.
                  </small>
                </span>

                <input
                  type="checkbox"
                  checked={
                    preferences
                      .overdue_enabled
                  }
                  onChange={(event) =>
                    setPreferences({
                      ...preferences,
                      overdue_enabled:
                        event.target
                          .checked,
                    })
                  }
                />
              </label>

              <div
                className={
                  styles.reminderDays
                }
              >
                <div>
                  <strong>
                    Antecedência
                  </strong>
                  <small>
                    Selecione quantos dias
                    antes.
                  </small>
                </div>

                <div
                  className={
                    styles.dayOptions
                  }
                >
                  {reminderDayOptions.map(
                    (day) => (
                      <button
                        type="button"
                        key={day}
                        className={
                          preferences
                            .reminder_days
                            .includes(day)
                            ? styles
                                .dayActive
                            : ""
                        }
                        onClick={() =>
                          toggleReminderDay(
                            day,
                          )
                        }
                      >
                        {day}d
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div
                className={
                  styles.browserBox
                }
              >
                <div>
                  <strong>
                    Avisos do navegador
                  </strong>

                  <p>
                    Exibe um aviso nativo
                    enquanto o Prumo estiver
                    aberto, mesmo com a aba
                    em segundo plano.
                  </p>
                </div>

                <Button
                  size="small"
                  variant="secondary"
                  onClick={() =>
                    void requestBrowserPermission()
                  }
                >
                  {preferences
                    .browser_notifications_enabled
                    ? "Permissão concedida"
                    : "Ativar no navegador"}
                </Button>
              </div>

              <Button
                isLoading={isSaving}
                onClick={() =>
                  void savePreferences()
                }
              >
                Salvar preferências
              </Button>
            </div>
          ) : (
            <PageState
              title="Carregando preferências"
              description="Preparando suas configurações."
            />
          )}
        </Card>
      </section>
    </div>
  );
}
