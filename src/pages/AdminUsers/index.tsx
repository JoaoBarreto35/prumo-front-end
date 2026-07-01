import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Modal } from "../../components/Modal";
import { PageSkeleton } from "../../components/PageSkeleton";
import { PageState } from "../../components/PageState";
import { ApiError } from "../../services/api";
import { adminService } from "../../services/adminService";
import type {
  AdminAction,
  AdminAuditItem,
  AdminSession,
  AdminUser,
  AdminUserList,
  TemporaryPasswordResult,
} from "../../types/admin";
import type {
  UserRole,
  UserStatus,
} from "../../types/auth";
import {
  getUserInitials,
} from "../../utils/userPresentation";

import styles from "./styles.module.css";


type PageTab =
  | "users"
  | "audit";


const statusLabels:
  Record<UserStatus, string> = {
    pending: "Pendente",
    active: "Ativo",
    rejected: "Rejeitado",
    suspended: "Suspenso",
  };


const roleLabels:
  Record<UserRole, string> = {
    user: "Usuário",
    admin: "Administrador",
  };


const auditLabels:
  Record<AdminAction, string> = {
    status_changed:
      "Status alterado",
    role_changed:
      "Função alterada",
    temporary_password_reset:
      "Senha temporária criada",
    session_revoked:
      "Sessão encerrada",
    all_sessions_revoked:
      "Todas as sessões encerradas",
  };


function statusVariant(
  status: UserStatus,
):
  | "positive"
  | "warning"
  | "negative"
  | "info" {
  if (status === "active") {
    return "positive";
  }

  if (status === "pending") {
    return "warning";
  }

  if (status === "rejected") {
    return "negative";
  }

  return "info";
}


function formatDateTime(
  value: string | null,
): string {
  if (!value) {
    return "Nunca";
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(new Date(value));
}


function metadataText(
  item: AdminAuditItem,
): string {
  const metadata =
    item.metadata;

  if (
    item.action === "status_changed"
  ) {
    return (
      `${String(
        metadata.from ?? "—",
      )} → ${String(
        metadata.to ?? "—",
      )}`
    );
  }

  if (
    item.action === "role_changed"
  ) {
    return (
      `${String(
        metadata.from ?? "—",
      )} → ${String(
        metadata.to ?? "—",
      )}`
    );
  }

  if (
    item.action
    === "temporary_password_reset"
    || item.action
    === "all_sessions_revoked"
  ) {
    return (
      `${String(
        metadata.sessions_revoked
        ?? 0,
      )} sessões encerradas`
    );
  }

  if (
    item.action
    === "session_revoked"
  ) {
    return (
      String(
        metadata.device_name
        ?? "Dispositivo sem nome",
      )
    );
  }

  return "—";
}


function sessionStatus(
  session: AdminSession,
): {
  label: string;
  variant:
    | "positive"
    | "neutral";
} {
  return session.is_active
    ? {
        label: "Ativa",
        variant: "positive",
      }
    : {
        label: "Encerrada",
        variant: "neutral",
      };
}


export function AdminUsersPage() {
  const [
    activeTab,
    setActiveTab,
  ] = useState<PageTab>(
    "users",
  );

  const [data, setData] =
    useState<
      AdminUserList | null
    >(null);

  const [search, setSearch] =
    useState("");

  const [
    debouncedSearch,
    setDebouncedSearch,
  ] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<
      UserStatus | "all"
    >("all");

  const [roleFilter, setRoleFilter] =
    useState<
      UserRole | "all"
    >("all");

  const [page, setPage] =
    useState(1);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [
    selectedUser,
    setSelectedUser,
  ] = useState<
    AdminUser | null
  >(null);

  const [sessions, setSessions] =
    useState<AdminSession[]>([]);

  const [
    isSessionsLoading,
    setIsSessionsLoading,
  ] = useState(false);

  const [reason, setReason] =
    useState("");

  const [runningAction, setRunningAction] =
    useState<string | null>(
      null,
    );

  const [
    temporaryPassword,
    setTemporaryPassword,
  ] = useState<
    TemporaryPasswordResult
      | null
  >(null);

  const [auditItems, setAuditItems] =
    useState<AdminAuditItem[]>(
      [],
    );

  const [auditPage, setAuditPage] =
    useState(1);

  const [
    auditTotalPages,
    setAuditTotalPages,
  ] = useState(1);

  const [auditAction, setAuditAction] =
    useState<
      AdminAction | "all"
    >("all");

  const [
    isAuditLoading,
    setIsAuditLoading,
  ] = useState(false);


  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          setDebouncedSearch(
            search,
          );
          setPage(1);
        },
        350,
      );

    return () => {
      window.clearTimeout(timer);
    };
  }, [search]);


  const loadUsers =
    useCallback(async () => {
      setIsLoading(true);
      setError("");

      try {
        const result =
          await adminService
            .listUsers({
              search:
                debouncedSearch,
              status:
                statusFilter,
              role: roleFilter,
              page,
              pageSize: 20,
            });

        setData(result);
      } catch (caughtError) {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "Não foi possível carregar os usuários.",
        );
      } finally {
        setIsLoading(false);
      }
    }, [
      debouncedSearch,
      page,
      roleFilter,
      statusFilter,
    ]);


  useEffect(() => {
    if (activeTab === "users") {
      void loadUsers();
    }
  }, [
    activeTab,
    loadUsers,
  ]);


  const loadAudit =
    useCallback(async () => {
      setIsAuditLoading(true);
      setError("");

      try {
        const result =
          await adminService
            .listAudit({
              action:
                auditAction,
              page: auditPage,
              pageSize: 30,
            });

        setAuditItems(
          result.items,
        );
        setAuditTotalPages(
          result.total_pages,
        );
      } catch (caughtError) {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "Não foi possível carregar a auditoria.",
        );
      } finally {
        setIsAuditLoading(false);
      }
    }, [
      auditAction,
      auditPage,
    ]);


  useEffect(() => {
    if (activeTab === "audit") {
      void loadAudit();
    }
  }, [
    activeTab,
    loadAudit,
  ]);


  const pendingUsers =
    useMemo(
      () =>
        data?.items.filter(
          (user) =>
            user.status
            === "pending",
        ) ?? [],
      [data],
    );


  async function openUser(
    user: AdminUser,
  ) {
    setSelectedUser(user);
    setReason("");
    setSessions([]);
    setIsSessionsLoading(true);

    try {
      const result =
        await adminService
          .listSessions(
            user.id,
          );

      setSessions(
        result.items,
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível carregar as sessões.",
      );
    } finally {
      setIsSessionsLoading(false);
    }
  }


  async function refreshAfterAction(
    message: string,
  ) {
    setSuccess(message);
    await loadUsers();

    if (selectedUser) {
      const refreshed =
        await adminService
          .listUsers({
            search:
              selectedUser.email,
            page: 1,
            pageSize: 20,
          });

      const current =
        refreshed.items.find(
          (user) =>
            user.id
            === selectedUser.id,
        );

      if (current) {
        setSelectedUser(
          current,
        );
      }
    }
  }


  async function changeStatus(
    user: AdminUser,
    nextStatus: UserStatus,
  ) {
    const key =
      `status:${user.id}`;
    setRunningAction(key);
    setError("");
    setSuccess("");

    try {
      const result =
        await adminService
          .updateStatus(
            user.id,
            nextStatus,
            reason,
          );

      await refreshAfterAction(
        result.message,
      );
      setReason("");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível alterar o status.",
      );
    } finally {
      setRunningAction(null);
    }
  }


  async function changeRole(
    user: AdminUser,
    nextRole: UserRole,
  ) {
    const key =
      `role:${user.id}`;
    setRunningAction(key);
    setError("");
    setSuccess("");

    try {
      const result =
        await adminService
          .updateRole(
            user.id,
            nextRole,
            reason,
          );

      await refreshAfterAction(
        result.message,
      );
      setReason("");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível alterar a função.",
      );
    } finally {
      setRunningAction(null);
    }
  }


  async function resetPassword(
    user: AdminUser,
  ) {
    const accepted =
      window.confirm(
        "Criar uma nova senha temporária? Todas as sessões do usuário serão encerradas.",
      );

    if (!accepted) {
      return;
    }

    const key =
      `password:${user.id}`;
    setRunningAction(key);
    setError("");

    try {
      const result =
        await adminService
          .resetTemporaryPassword(
            user.id,
          );

      setTemporaryPassword(
        result,
      );
      setSelectedUser(null);
      await loadUsers();
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível gerar a senha temporária.",
      );
    } finally {
      setRunningAction(null);
    }
  }


  async function revokeSession(
    user: AdminUser,
    session: AdminSession,
  ) {
    const key =
      `session:${session.id}`;
    setRunningAction(key);
    setError("");

    try {
      const result =
        await adminService
          .revokeSession(
            user.id,
            session.id,
          );

      const sessionResult =
        await adminService
          .listSessions(
            user.id,
          );

      setSessions(
        sessionResult.items,
      );
      await refreshAfterAction(
        result.message,
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível encerrar a sessão.",
      );
    } finally {
      setRunningAction(null);
    }
  }


  async function revokeAllSessions(
    user: AdminUser,
  ) {
    const accepted =
      window.confirm(
        "Encerrar todas as sessões ativas deste usuário?",
      );

    if (!accepted) {
      return;
    }

    const key =
      `sessions:${user.id}`;
    setRunningAction(key);
    setError("");

    try {
      const result =
        await adminService
          .revokeAllSessions(
            user.id,
          );

      const sessionResult =
        await adminService
          .listSessions(
            user.id,
          );

      setSessions(
        sessionResult.items,
      );
      await refreshAfterAction(
        result.message,
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível encerrar as sessões.",
      );
    } finally {
      setRunningAction(null);
    }
  }


  async function copyPassword() {
    if (!temporaryPassword) {
      return;
    }

    try {
      await navigator.clipboard
        .writeText(
          temporaryPassword
            .temporary_password,
        );

      setSuccess(
        "Senha temporária copiada.",
      );
    } catch {
      setError(
        "Não foi possível copiar automaticamente.",
      );
    }
  }


  function renderQuickActions(
    user: AdminUser,
  ) {
    if (user.is_current_admin) {
      return (
        <span
          className={
            styles.selfLabel
          }
        >
          Sua conta
        </span>
      );
    }

    if (
      user.status === "pending"
    ) {
      return (
        <>
          <Button
            size="small"
            isLoading={
              runningAction
              === `status:${user.id}`
            }
            onClick={() =>
              void changeStatus(
                user,
                "active",
              )
            }
          >
            Aprovar
          </Button>

          <Button
            size="small"
            variant="danger"
            disabled={
              runningAction
              !== null
            }
            onClick={() =>
              void changeStatus(
                user,
                "rejected",
              )
            }
          >
            Rejeitar
          </Button>
        </>
      );
    }

    return (
      <Button
        size="small"
        variant="tertiary"
        onClick={() =>
          void openUser(user)
        }
      >
        Gerenciar
      </Button>
    );
  }


  return (
    <div className={styles.page}>
      <header
        className={
          styles.pageHeader
        }
      >
        <div>
          <span
            className={
              styles.eyebrow
            }
          >
            Acesso e segurança
          </span>

          <h1>
            Administração
          </h1>

          <p>
            Gerencie usuários sem
            visualizar informações
            financeiras pessoais.
          </p>
        </div>

        <nav
          className={styles.tabs}
          aria-label="Seções administrativas"
        >
          <button
            type="button"
            className={
              activeTab === "users"
                ? styles.tabActive
                : ""
            }
            onClick={() =>
              setActiveTab("users")
            }
          >
            Usuários
          </button>

          <button
            type="button"
            className={
              activeTab === "audit"
                ? styles.tabActive
                : ""
            }
            onClick={() =>
              setActiveTab("audit")
            }
          >
            Auditoria
          </button>
        </nav>
      </header>

      {error ? (
        <div
          className={styles.error}
        >
          {error}
        </div>
      ) : null}

      {success ? (
        <div
          className={
            styles.success
          }
        >
          {success}
        </div>
      ) : null}

      {activeTab === "users" ? (
        <>
          {data ? (
            <section
              className={
                styles.summaryGrid
              }
            >
              <Card>
                <div
                  className={
                    styles.metric
                  }
                >
                  <span>Total</span>
                  <strong>
                    {
                      data.summary
                        .total
                    }
                  </strong>
                </div>
              </Card>

              <Card>
                <div
                  className={
                    styles.metric
                  }
                >
                  <span>Pendentes</span>
                  <strong
                    className={
                      data.summary
                        .pending > 0
                        ? styles.warning
                        : ""
                    }
                  >
                    {
                      data.summary
                        .pending
                    }
                  </strong>
                </div>
              </Card>

              <Card>
                <div
                  className={
                    styles.metric
                  }
                >
                  <span>Ativos</span>
                  <strong
                    className={
                      styles.positive
                    }
                  >
                    {
                      data.summary
                        .active
                    }
                  </strong>
                </div>
              </Card>

              <Card>
                <div
                  className={
                    styles.metric
                  }
                >
                  <span>Sessões</span>
                  <strong>
                    {
                      data.summary
                        .active_sessions
                    }
                  </strong>
                </div>
              </Card>
            </section>
          ) : null}

          {pendingUsers.length > 0 ? (
            <Card
              title="Aguardando aprovação"
              description={
                `${pendingUsers.length} `
                + `${pendingUsers.length === 1 ? "cadastro requer" : "cadastros requerem"} atenção.`
              }
            >
              <div
                className={
                  styles.pendingList
                }
              >
                {pendingUsers.map(
                  (user) => (
                    <article
                      key={user.id}
                    >
                      <span
                        className={
                          styles.avatar
                        }
                      >
                        {getUserInitials(
                          user.name,
                        )}
                      </span>

                      <div>
                        <strong>
                          {user.name}
                        </strong>
                        <small>
                          {user.email}
                        </small>
                      </div>

                      <div
                        className={
                          styles.rowActions
                        }
                      >
                        {renderQuickActions(
                          user,
                        )}
                      </div>
                    </article>
                  ),
                )}
              </div>
            </Card>
          ) : null}

          <Card
            title="Usuários"
            description={
              data
                ? `${data.total} resultado${data.total === 1 ? "" : "s"}`
                : "Carregando usuários"
            }
          >
            <div
              className={
                styles.filters
              }
            >
              <label
                className={
                  styles.searchField
                }
              >
                <span>Buscar</span>
                <input
                  type="search"
                  placeholder="Nome ou e-mail"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target
                        .value,
                    )
                  }
                />
              </label>

              <label>
                <span>Status</span>
                <select
                  value={
                    statusFilter
                  }
                  onChange={(event) => {
                    setStatusFilter(
                      event.target.value as UserStatus | "all",
                    );
                    setPage(1);
                  }}
                >
                  <option value="all">
                    Todos
                  </option>
                  <option value="pending">
                    Pendentes
                  </option>
                  <option value="active">
                    Ativos
                  </option>
                  <option value="rejected">
                    Rejeitados
                  </option>
                  <option value="suspended">
                    Suspensos
                  </option>
                </select>
              </label>

              <label>
                <span>Função</span>
                <select
                  value={roleFilter}
                  onChange={(event) => {
                    setRoleFilter(
                      event.target.value as UserRole | "all",
                    );
                    setPage(1);
                  }}
                >
                  <option value="all">
                    Todas
                  </option>
                  <option value="user">
                    Usuários
                  </option>
                  <option value="admin">
                    Administradores
                  </option>
                </select>
              </label>
            </div>

            {isLoading ? (
              <PageSkeleton
                cards={0}
                rows={6}
              />
            ) : !data
            || data.items.length
            === 0 ? (
              <PageState
                title="Nenhum usuário encontrado"
                description="Altere a busca ou os filtros."
              />
            ) : (
              <>
                <div
                  className={
                    styles.userTable
                  }
                >
                  <div
                    className={
                      styles.tableHeader
                    }
                  >
                    <span>Usuário</span>
                    <span>Status</span>
                    <span>Função</span>
                    <span>
                      Último acesso
                    </span>
                    <span>Sessões</span>
                    <span>Ações</span>
                  </div>

                  {data.items.map(
                    (user) => (
                      <article
                        key={user.id}
                        className={
                          styles.userRow
                        }
                      >
                        <button
                          type="button"
                          className={
                            styles.userIdentity
                          }
                          onClick={() =>
                            void openUser(
                              user,
                            )
                          }
                        >
                          <span
                            className={
                              styles.avatar
                            }
                          >
                            {getUserInitials(
                              user.name,
                            )}
                          </span>

                          <span>
                            <strong>
                              {user.name}
                            </strong>
                            <small>
                              {user.email}
                            </small>
                          </span>
                        </button>

                        <div
                          data-label="Status"
                        >
                          <Badge
                            variant={
                              statusVariant(
                                user.status,
                              )
                            }
                          >
                            {
                              statusLabels[
                                user.status
                              ]
                            }
                          </Badge>
                        </div>

                        <div
                          data-label="Função"
                        >
                          <span>
                            {
                              roleLabels[
                                user.role
                              ]
                            }
                          </span>
                        </div>

                        <div
                          data-label="Último acesso"
                        >
                          <span>
                            {formatDateTime(
                              user
                                .last_login_at,
                            )}
                          </span>
                        </div>

                        <div
                          data-label="Sessões"
                        >
                          <span>
                            {
                              user
                                .active_session_count
                            }
                          </span>
                        </div>

                        <div
                          className={
                            styles.rowActions
                          }
                          data-label="Ações"
                        >
                          {renderQuickActions(
                            user,
                          )}
                        </div>
                      </article>
                    ),
                  )}
                </div>

                <div
                  className={
                    styles.pagination
                  }
                >
                  <Button
                    size="small"
                    variant="secondary"
                    disabled={page <= 1}
                    onClick={() =>
                      setPage(
                        (current) =>
                          current - 1,
                      )
                    }
                  >
                    Anterior
                  </Button>

                  <span>
                    Página {page} de{" "}
                    {
                      data.total_pages
                    }
                  </span>

                  <Button
                    size="small"
                    variant="secondary"
                    disabled={
                      page
                      >= data.total_pages
                    }
                    onClick={() =>
                      setPage(
                        (current) =>
                          current + 1,
                      )
                    }
                  >
                    Próxima
                  </Button>
                </div>
              </>
            )}
          </Card>
        </>
      ) : (
        <Card
          title="Auditoria administrativa"
          description="Histórico de alterações de acesso e segurança."
        >
          <div
            className={
              styles.auditFilter
            }
          >
            <label>
              <span>Tipo de ação</span>
              <select
                value={auditAction}
                onChange={(event) => {
                  setAuditAction(
                    event.target.value as AdminAction | "all",
                  );
                  setAuditPage(1);
                }}
              >
                <option value="all">
                  Todas
                </option>
                {(
                  Object.entries(
                    auditLabels,
                  ) as Array<
                    [
                      AdminAction,
                      string,
                    ]
                  >
                ).map(
                  ([
                    value,
                    label,
                  ]) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {label}
                    </option>
                  ),
                )}
              </select>
            </label>
          </div>

          {isAuditLoading ? (
            <PageSkeleton
              cards={0}
              rows={7}
            />
          ) : auditItems.length
          === 0 ? (
            <PageState
              title="Nenhuma ação registrada"
              description="As alterações administrativas aparecerão aqui."
            />
          ) : (
            <>
              <div
                className={
                  styles.auditList
                }
              >
                {auditItems.map(
                  (item) => (
                    <article
                      key={item.id}
                    >
                      <span
                        className={
                          styles.auditIcon
                        }
                      >
                        ◇
                      </span>

                      <div>
                        <strong>
                          {
                            auditLabels[
                              item.action
                            ]
                          }
                        </strong>

                        <p>
                          {item.admin_name}
                          {" → "}
                          {item.target_name
                            ?? "Usuário removido"}
                        </p>

                        <small>
                          {metadataText(
                            item,
                          )}
                        </small>
                      </div>

                      <time>
                        {formatDateTime(
                          item.created_at,
                        )}
                      </time>
                    </article>
                  ),
                )}
              </div>

              <div
                className={
                  styles.pagination
                }
              >
                <Button
                  size="small"
                  variant="secondary"
                  disabled={
                    auditPage <= 1
                  }
                  onClick={() =>
                    setAuditPage(
                      (current) =>
                        current - 1,
                    )
                  }
                >
                  Anterior
                </Button>

                <span>
                  Página {auditPage} de{" "}
                  {auditTotalPages}
                </span>

                <Button
                  size="small"
                  variant="secondary"
                  disabled={
                    auditPage
                    >= auditTotalPages
                  }
                  onClick={() =>
                    setAuditPage(
                      (current) =>
                        current + 1,
                    )
                  }
                >
                  Próxima
                </Button>
              </div>
            </>
          )}
        </Card>
      )}

      <Modal
        title={
          selectedUser
            ? selectedUser.name
            : "Usuário"
        }
        description={
          selectedUser?.email
        }
        isOpen={
          selectedUser !== null
        }
        onClose={() =>
          setSelectedUser(null)
        }
      >
        {selectedUser ? (
          <div
            className={
              styles.userModal
            }
          >
            <section
              className={
                styles.profileSummary
              }
            >
              <span
                className={
                  styles.largeAvatar
                }
              >
                {getUserInitials(
                  selectedUser.name,
                )}
              </span>

              <div>
                <div
                  className={
                    styles.badges
                  }
                >
                  <Badge
                    variant={
                      statusVariant(
                        selectedUser
                          .status,
                      )
                    }
                  >
                    {
                      statusLabels[
                        selectedUser
                          .status
                      ]
                    }
                  </Badge>

                  <Badge variant="info">
                    {
                      roleLabels[
                        selectedUser.role
                      ]
                    }
                  </Badge>

                  {selectedUser
                    .must_change_password ? (
                    <Badge variant="warning">
                      Troca de senha
                    </Badge>
                  ) : null}
                </div>

                <p>
                  Cadastro em{" "}
                  {formatDateTime(
                    selectedUser
                      .created_at,
                  )}
                </p>
              </div>
            </section>

            <section
              className={
                styles.userCounts
              }
            >
              <article>
                <span>Contas</span>
                <strong>
                  {
                    selectedUser
                      .account_count
                  }
                </strong>
              </article>

              <article>
                <span>Categorias</span>
                <strong>
                  {
                    selectedUser
                      .category_count
                  }
                </strong>
              </article>

              <article>
                <span>
                  Movimentações
                </span>
                <strong>
                  {
                    selectedUser
                      .transaction_count
                  }
                </strong>
              </article>

              <article>
                <span>Sessões</span>
                <strong>
                  {
                    selectedUser
                      .active_session_count
                  }
                </strong>
              </article>
            </section>

            {selectedUser
              .is_current_admin ? (
              <aside
                className={
                  styles.selfNotice
                }
              >
                Esta é sua conta. Use
                Perfil e Segurança para
                alterar seus próprios
                dados.
              </aside>
            ) : (
              <>
                <label
                  className={
                    styles.reasonField
                  }
                >
                  <span>
                    Motivo opcional
                  </span>

                  <textarea
                    rows={2}
                    maxLength={500}
                    placeholder="Registrado na auditoria"
                    value={reason}
                    onChange={(event) =>
                      setReason(
                        event.target
                          .value,
                      )
                    }
                  />
                </label>

                <section
                  className={
                    styles.management
                  }
                >
                  <div>
                    <strong>
                      Acesso
                    </strong>

                    <div
                      className={
                        styles.managementActions
                      }
                    >
                      {selectedUser.status
                      !== "active" ? (
                        <Button
                          size="small"
                          isLoading={
                            runningAction
                            === `status:${selectedUser.id}`
                          }
                          onClick={() =>
                            void changeStatus(
                              selectedUser,
                              "active",
                            )
                          }
                        >
                          Ativar
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          variant="danger"
                          isLoading={
                            runningAction
                            === `status:${selectedUser.id}`
                          }
                          onClick={() =>
                            void changeStatus(
                              selectedUser,
                              "suspended",
                            )
                          }
                        >
                          Suspender
                        </Button>
                      )}

                      {selectedUser.status
                      === "pending" ? (
                        <Button
                          size="small"
                          variant="danger"
                          disabled={
                            runningAction
                            !== null
                          }
                          onClick={() =>
                            void changeStatus(
                              selectedUser,
                              "rejected",
                            )
                          }
                        >
                          Rejeitar
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <strong>
                      Função
                    </strong>

                    <div
                      className={
                        styles.managementActions
                      }
                    >
                      <Button
                        size="small"
                        variant="secondary"
                        isLoading={
                          runningAction
                          === `role:${selectedUser.id}`
                        }
                        disabled={
                          selectedUser
                            .status
                          !== "active"
                        }
                        onClick={() =>
                          void changeRole(
                            selectedUser,
                            selectedUser.role
                            === "admin"
                              ? "user"
                              : "admin",
                          )
                        }
                      >
                        {selectedUser.role
                        === "admin"
                          ? "Remover admin"
                          : "Tornar admin"}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <strong>
                      Credenciais
                    </strong>

                    <div
                      className={
                        styles.managementActions
                      }
                    >
                      <Button
                        size="small"
                        variant="secondary"
                        isLoading={
                          runningAction
                          === `password:${selectedUser.id}`
                        }
                        onClick={() =>
                          void resetPassword(
                            selectedUser,
                          )
                        }
                      >
                        Gerar senha temporária
                      </Button>
                    </div>
                  </div>
                </section>
              </>
            )}

            <section
              className={
                styles.sessionsSection
              }
            >
              <header>
                <div>
                  <strong>
                    Sessões
                  </strong>
                  <span>
                    {
                      selectedUser
                        .active_session_count
                    }{" "}
                    ativas
                  </span>
                </div>

                {!selectedUser
                  .is_current_admin
                && selectedUser
                  .active_session_count
                > 0 ? (
                  <Button
                    size="small"
                    variant="danger"
                    isLoading={
                      runningAction
                      === `sessions:${selectedUser.id}`
                    }
                    onClick={() =>
                      void revokeAllSessions(
                        selectedUser,
                      )
                    }
                  >
                    Encerrar todas
                  </Button>
                ) : null}
              </header>

              {isSessionsLoading ? (
                <p>
                  Carregando sessões...
                </p>
              ) : sessions.length
              === 0 ? (
                <p>
                  Nenhuma sessão registrada.
                </p>
              ) : (
                <div
                  className={
                    styles.sessionList
                  }
                >
                  {sessions.map(
                    (session) => {
                      const currentStatus =
                        sessionStatus(
                          session,
                        );

                      return (
                        <article
                          key={
                            session.id
                          }
                        >
                          <div>
                            <strong>
                              {session
                                .device_name
                                ?? "Dispositivo sem nome"}
                            </strong>

                            <small>
                              Criada em{" "}
                              {formatDateTime(
                                session
                                  .created_at,
                              )}
                            </small>
                          </div>

                          <Badge
                            variant={
                              currentStatus
                                .variant
                            }
                          >
                            {
                              currentStatus
                                .label
                            }
                          </Badge>

                          {session.is_active
                          && !selectedUser
                            .is_current_admin ? (
                            <Button
                              size="small"
                              variant="tertiary"
                              isLoading={
                                runningAction
                                === `session:${session.id}`
                              }
                              onClick={() =>
                                void revokeSession(
                                  selectedUser,
                                  session,
                                )
                              }
                            >
                              Encerrar
                            </Button>
                          ) : null}
                        </article>
                      );
                    },
                  )}
                </div>
              )}
            </section>
          </div>
        ) : null}
      </Modal>

      <Modal
        title="Senha temporária"
        description={
          "Ela será exibida somente agora."
        }
        isOpen={
          temporaryPassword
          !== null
        }
        onClose={() =>
          setTemporaryPassword(null)
        }
      >
        {temporaryPassword ? (
          <div
            className={
              styles.passwordModal
            }
          >
            <aside>
              Entregue a senha de forma
              segura. No próximo login,
              o usuário será obrigado a
              criar uma senha pessoal.
            </aside>

            <code>
              {
                temporaryPassword
                  .temporary_password
              }
            </code>

            <p>
              {
                temporaryPassword
                  .sessions_revoked
              }{" "}
              sessões foram encerradas.
            </p>

            <div>
              <Button
                variant="secondary"
                onClick={() =>
                  setTemporaryPassword(
                    null,
                  )
                }
              >
                Fechar
              </Button>

              <Button
                onClick={() =>
                  void copyPassword()
                }
              >
                Copiar senha
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
