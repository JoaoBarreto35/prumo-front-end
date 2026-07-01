import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  Link,
  useLocation,
} from "react-router";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { PageState } from "../../components/PageState";
import { SettingsNavigation } from "../../components/SettingsNavigation";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { ApiError } from "../../services/api";
import {
  applyVisualPreferences,
  settingsService,
} from "../../services/settingsService";
import type {
  ChangePasswordInput,
  DefaultPagePreference,
  DensityPreference,
  Profile,
  ThemePreference,
  UserPreferences,
  UserSession,
} from "../../types/settings";
import {
  useNavigate,
} from "react-router";
import {
  onboardingService,
} from "../../services/onboardingService";

import styles from "./styles.module.css";


type SettingsSection =
  | "profile"
  | "preferences"
  | "security"
  | "appearance";


const defaultPreferences:
  UserPreferences = {
  theme: "system",
  density: "comfortable",
  reduce_motion: false,
  default_page: "/home",
};


const pageOptions: Array<{
  value: DefaultPagePreference;
  label: string;
  description: string;
}> = [
    {
      value: "/home",
      label: "Home",
      description:
        "Resumo financeiro e ações rápidas.",
    },
    {
      value: "/calendar",
      label: "Calendário",
      description:
        "Prazos organizados por data.",
    },
    {
      value: "/transactions",
      label: "Movimentações",
      description:
        "Histórico e filtros completos.",
    },
    {
      value: "/planning",
      label: "Planejamento",
      description:
        "Projeções e cenários futuros.",
    },
    {
      value: "/reports",
      label: "Relatórios",
      description:
        "Gráficos e análises financeiras.",
    },
  ];


function getSection(
  pathname: string,
): SettingsSection {
  if (
    pathname.endsWith(
      "/preferences",
    )
  ) {
    return "preferences";
  }

  if (
    pathname.endsWith(
      "/security",
    )
  ) {
    return "security";
  }

  if (
    pathname.endsWith(
      "/appearance",
    )
  ) {
    return "appearance";
  }

  return "profile";
}


function formatDateTime(
  value: string | null,
): string {
  if (!value) {
    return "Ainda não registrado";
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(new Date(value));
}


function initials(
  name: string,
): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}


export function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const section = getSection(
    location.pathname,
  );

  const {
    user,
    refreshUser,
  } = useAuth();

  const {
    theme,
    setTheme,
  } = useTheme();

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [
    preferences,
    setPreferences,
  ] = useState<UserPreferences>(
    defaultPreferences,
  );

  const [sessions, setSessions] =
    useState<UserSession[]>([]);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [
    passwordForm,
    setPasswordForm,
  ] = useState<ChangePasswordInput>({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  const loadSection =
    useCallback(async () => {
      setIsLoading(true);
      setError("");
      setSuccess("");

      try {
        if (section === "profile") {
          const data =
            await settingsService
              .getProfile();

          setProfile(data);
          setName(data.name);
          setEmail(data.email);
        } else if (
          section === "security"
        ) {
          const data =
            await settingsService
              .getSecurity();

          setSessions(data.sessions);
        } else {
          const data =
            await settingsService
              .getPreferences();

          setPreferences(data);
        }
      } catch (caughtError) {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "Não foi possível carregar as configurações.",
        );
      } finally {
        setIsLoading(false);
      }
    }, [section]);


  useEffect(() => {
    void loadSection();
  }, [loadSection]);


  function showError(
    caughtError: unknown,
    fallback: string,
  ) {
    setError(
      caughtError instanceof ApiError
        ? caughtError.message
        : fallback,
    );
  }


  async function saveProfile(
    event: FormEvent,
  ) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const updated =
        await settingsService
          .updateProfile({
            name,
            email,
          });

      setProfile(updated);
      await refreshUser();
      setSuccess(
        "Perfil atualizado com sucesso.",
      );
    } catch (caughtError) {
      showError(
        caughtError,
        "Não foi possível atualizar o perfil.",
      );
    } finally {
      setIsSaving(false);
    }
  }


  async function savePreferences() {
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const updated =
        await settingsService
          .updatePreferences(
            preferences,
          );

      setPreferences(updated);
      setSuccess(
        "Preferências salvas.",
      );
    } catch (caughtError) {
      showError(
        caughtError,
        "Não foi possível salvar as preferências.",
      );
    } finally {
      setIsSaving(false);
    }
  }


  async function saveAppearance() {
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...preferences,
        theme:
          theme as ThemePreference,
      };

      const updated =
        await settingsService
          .updatePreferences(
            payload,
          );

      setPreferences(updated);
      setTheme(updated.theme);
      applyVisualPreferences(
        updated,
      );
      setSuccess(
        "Aparência salva e aplicada.",
      );
    } catch (caughtError) {
      showError(
        caughtError,
        "Não foi possível salvar a aparência.",
      );
    } finally {
      setIsSaving(false);
    }
  }


  async function changePassword(
    event: FormEvent,
  ) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const result =
        await settingsService
          .changePassword(
            passwordForm,
          );

      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });

      await refreshUser();

      const security =
        await settingsService
          .getSecurity();

      setSessions(
        security.sessions,
      );
      setSuccess(result.message);
    } catch (caughtError) {
      showError(
        caughtError,
        "Não foi possível alterar a senha.",
      );
    } finally {
      setIsSaving(false);
    }
  }


  async function revokeSession(
    sessionId: string,
  ) {
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const result =
        await settingsService
          .revokeSession(
            sessionId,
          );

      const security =
        await settingsService
          .getSecurity();

      setSessions(
        security.sessions,
      );
      setSuccess(result.message);
    } catch (caughtError) {
      showError(
        caughtError,
        "Não foi possível encerrar a sessão.",
      );
    } finally {
      setIsSaving(false);
    }
  }


  async function revokeOthers() {
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const result =
        await settingsService
          .revokeOtherSessions();

      const security =
        await settingsService
          .getSecurity();

      setSessions(
        security.sessions,
      );
      setSuccess(result.message);
    } catch (caughtError) {
      showError(
        caughtError,
        "Não foi possível encerrar as outras sessões.",
      );
    } finally {
      setIsSaving(false);
    }
  }


  function renderProfile() {
    if (!profile) {
      return null;
    }

    return (
      <div className={styles.stack}>
        <Card>
          <div
            className={
              styles.profileSummary
            }
          >
            <span
              className={styles.avatar}
            >
              {initials(profile.name)}
            </span>

            <div>
              <h2>{profile.name}</h2>
              <p>{profile.email}</p>

              <div
                className={
                  styles.badges
                }
              >
                <span>
                  {profile.role === "admin"
                    ? "Administrador"
                    : "Usuário"}
                </span>

                <span>
                  Conta ativa
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card
          title="Informações pessoais"
          description={
            "Atualize como seu nome "
            + "e e-mail aparecem no Prumo."
          }
        >
          <form
            className={styles.form}
            onSubmit={(event) =>
              void saveProfile(event)
            }
          >
            <label>
              <span>Nome completo</span>
              <input
                value={name}
                minLength={2}
                maxLength={120}
                required
                onChange={(event) =>
                  setName(
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              <span>E-mail</span>
              <input
                type="email"
                value={email}
                required
                onChange={(event) =>
                  setEmail(
                    event.target.value,
                  )
                }
              />
            </label>

            <div
              className={
                styles.formActions
              }
            >
              <Button
                type="submit"
                isLoading={isSaving}
              >
                Salvar perfil
              </Button>
            </div>
          </form>
        </Card>

        <Card
          title="Informações da conta"
        >
          <dl
            className={
              styles.detailGrid
            }
          >
            <div>
              <dt>Conta criada em</dt>
              <dd>
                {formatDateTime(
                  profile.created_at,
                )}
              </dd>
            </div>

            <div>
              <dt>Último acesso</dt>
              <dd>
                {formatDateTime(
                  profile.last_login_at,
                )}
              </dd>
            </div>

            <div>
              <dt>Identificador</dt>
              <dd
                className={
                  styles.monospace
                }
              >
                {profile.id}
              </dd>
            </div>
          </dl>
        </Card>
        <Card
          title="Configuração inicial"
          description="Revise contas, categorias, renda e despesas fixas."
        >
          <div>
            <p>
              Refazer o onboarding não apaga
              dados existentes. As etapas já
              criadas aparecem como concluídas.
            </p>

            <Button
              variant="secondary"
              onClick={async () => {
                await onboardingService
                  .restart();

                navigate(
                  "/onboarding",
                  {
                    replace: true,
                  },
                );
              }}
            >
              Refazer onboarding
            </Button>
          </div>
        </Card>

      </div>
    );
  }


  function renderPreferences() {
    return (
      <div className={styles.stack}>
        <Card
          title="Página inicial"
          description={
            "Escolha qual área deve "
            + "abrir depois do login."
          }
        >
          <div
            className={
              styles.choiceGrid
            }
          >
            {pageOptions.map(
              (option) => (
                <label
                  key={option.value}
                  className={[
                    styles.choice,
                    preferences
                      .default_page
                      === option.value
                      ? styles.choiceActive
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <input
                    type="radio"
                    name="default-page"
                    checked={
                      preferences
                        .default_page
                      === option.value
                    }
                    onChange={() =>
                      setPreferences(
                        (current) => ({
                          ...current,
                          default_page:
                            option.value,
                        }),
                      )
                    }
                  />

                  <span>
                    <strong>
                      {option.label}
                    </strong>
                    <small>
                      {
                        option
                          .description
                      }
                    </small>
                  </span>
                </label>
              ),
            )}
          </div>

          <div
            className={
              styles.formActions
            }
          >
            <Button
              isLoading={isSaving}
              onClick={() =>
                void savePreferences()
              }
            >
              Salvar preferências
            </Button>
          </div>
        </Card>

        <Card
          title="Lembretes"
          description={
            "Os alertas de vencimento "
            + "possuem configurações próprias."
          }
        >
          <div
            className={
              styles.linkCard
            }
          >
            <div>
              <strong>
                Central de notificações
              </strong>
              <p>
                Ajuste antecedência,
                avisos de hoje, atrasos
                e notificações do navegador.
              </p>
            </div>

            <Link
              to="/notifications"
            >
              Configurar lembretes
            </Link>
          </div>
        </Card>

        <Card title="Regional">
          <dl
            className={
              styles.detailGrid
            }
          >
            <div>
              <dt>Idioma</dt>
              <dd>
                Português do Brasil
              </dd>
            </div>

            <div>
              <dt>Moeda</dt>
              <dd>
                Real brasileiro (BRL)
              </dd>
            </div>

            <div>
              <dt>Fuso horário</dt>
              <dd>
                America/Sao_Paulo
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    );
  }


  function renderSecurity() {
    return (
      <div className={styles.stack}>
        <Card
          title="Alterar senha"
          description={
            "A nova senha encerra "
            + "automaticamente as outras sessões."
          }
        >
          <form
            className={styles.form}
            onSubmit={(event) =>
              void changePassword(event)
            }
          >
            <label>
              <span>Senha atual</span>
              <input
                type="password"
                autoComplete="current-password"
                value={
                  passwordForm
                    .current_password
                }
                required
                onChange={(event) =>
                  setPasswordForm(
                    (current) => ({
                      ...current,
                      current_password:
                        event.target.value,
                    }),
                  )
                }
              />
            </label>

            <div
              className={
                styles.twoColumns
              }
            >
              <label>
                <span>Nova senha</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={
                    passwordForm
                      .new_password
                  }
                  required
                  onChange={(event) =>
                    setPasswordForm(
                      (current) => ({
                        ...current,
                        new_password:
                          event.target.value,
                      }),
                    )
                  }
                />
              </label>

              <label>
                <span>
                  Confirmar nova senha
                </span>
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={
                    passwordForm
                      .confirm_password
                  }
                  required
                  onChange={(event) =>
                    setPasswordForm(
                      (current) => ({
                        ...current,
                        confirm_password:
                          event.target.value,
                      }),
                    )
                  }
                />
              </label>
            </div>

            <p
              className={
                styles.helper
              }
            >
              Use pelo menos oito
              caracteres, com maiúscula,
              minúscula e número.
            </p>

            <div
              className={
                styles.formActions
              }
            >
              <Button
                type="submit"
                isLoading={isSaving}
              >
                Alterar senha
              </Button>
            </div>
          </form>
        </Card>

        <Card
          title="Sessões ativas"
          description={
            `${sessions.length} `
            + `${sessions.length === 1 ? "dispositivo conectado" : "dispositivos conectados"}.`
          }
        >
          <div
            className={
              styles.sessionList
            }
          >
            {sessions.map(
              (session) => (
                <article
                  className={
                    styles.session
                  }
                  key={session.id}
                >
                  <span
                    className={
                      styles.deviceIcon
                    }
                  >
                    ◫
                  </span>

                  <div>
                    <strong>
                      {session.device_name
                        || "Dispositivo sem nome"}
                    </strong>

                    <span>
                      Iniciada em{" "}
                      {formatDateTime(
                        session.created_at,
                      )}
                    </span>

                    <small>
                      Expira em{" "}
                      {formatDateTime(
                        session.expires_at,
                      )}
                    </small>
                  </div>

                  {session.is_current ? (
                    <span
                      className={
                        styles.currentBadge
                      }
                    >
                      Esta sessão
                    </span>
                  ) : (
                    <Button
                      size="small"
                      variant="tertiary"
                      disabled={isSaving}
                      onClick={() =>
                        void revokeSession(
                          session.id,
                        )
                      }
                    >
                      Encerrar
                    </Button>
                  )}
                </article>
              ),
            )}
          </div>

          {sessions.some(
            (session) =>
              !session.is_current,
          ) ? (
            <div
              className={
                styles.formActions
              }
            >
              <Button
                variant="secondary"
                disabled={isSaving}
                onClick={() =>
                  void revokeOthers()
                }
              >
                Encerrar outras sessões
              </Button>
            </div>
          ) : null}
        </Card>
      </div>
    );
  }


  function renderAppearance() {
    const themes: Array<{
      value: ThemePreference;
      label: string;
      description: string;
    }> = [
        {
          value: "light",
          label: "Claro",
          description:
            "Sempre usar o tema claro.",
        },
        {
          value: "dark",
          label: "Escuro",
          description:
            "Sempre usar o tema escuro.",
        },
        {
          value: "system",
          label: "Sistema",
          description:
            "Acompanhar o dispositivo.",
        },
      ];

    const densities: Array<{
      value: DensityPreference;
      label: string;
      description: string;
    }> = [
        {
          value: "comfortable",
          label: "Confortável",
          description:
            "Mais espaço entre elementos.",
        },
        {
          value: "compact",
          label: "Compacta",
          description:
            "Mais informações na tela.",
        },
      ];

    return (
      <div className={styles.stack}>
        <Card
          title="Tema"
          description={
            "A escolha é sincronizada "
            + "entre seus dispositivos."
          }
        >
          <div
            className={
              styles.choiceGrid
            }
          >
            {themes.map(
              (option) => (
                <button
                  type="button"
                  key={option.value}
                  className={[
                    styles.visualChoice,
                    theme
                      === option.value
                      ? styles.choiceActive
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() =>
                    setTheme(
                      option.value,
                    )
                  }
                >
                  <span
                    className={[
                      styles.themePreview,
                      styles[
                      `preview${option.value
                        .charAt(0)
                        .toUpperCase()}${option.value
                          .slice(1)}`
                      ],
                    ].join(" ")}
                  />

                  <strong>
                    {option.label}
                  </strong>

                  <small>
                    {option.description}
                  </small>
                </button>
              ),
            )}
          </div>
        </Card>

        <Card
          title="Densidade"
          description={
            "Controle o espaçamento "
            + "geral da interface."
          }
        >
          <div
            className={
              styles.choiceGrid
            }
          >
            {densities.map(
              (option) => (
                <label
                  key={option.value}
                  className={[
                    styles.choice,
                    preferences.density
                      === option.value
                      ? styles.choiceActive
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <input
                    type="radio"
                    name="density"
                    checked={
                      preferences.density
                      === option.value
                    }
                    onChange={() => {
                      const updated = {
                        ...preferences,
                        density:
                          option.value,
                      };

                      setPreferences(
                        updated,
                      );
                      applyVisualPreferences(
                        updated,
                      );
                    }}
                  />

                  <span>
                    <strong>
                      {option.label}
                    </strong>
                    <small>
                      {
                        option
                          .description
                      }
                    </small>
                  </span>
                </label>
              ),
            )}
          </div>
        </Card>

        <Card title="Movimento">
          <label
            className={
              styles.toggle
            }
          >
            <span>
              <strong>
                Reduzir animações
              </strong>
              <small>
                Diminui transições e
                movimentos na interface.
              </small>
            </span>

            <input
              type="checkbox"
              checked={
                preferences
                  .reduce_motion
              }
              onChange={(event) => {
                const updated = {
                  ...preferences,
                  reduce_motion:
                    event.target
                      .checked,
                };

                setPreferences(
                  updated,
                );
                applyVisualPreferences(
                  updated,
                );
              }}
            />
          </label>
        </Card>

        <div
          className={
            styles.formActions
          }
        >
          <Button
            isLoading={isSaving}
            onClick={() =>
              void saveAppearance()
            }
          >
            Salvar aparência
          </Button>
        </div>
      </div>
    );
  }


  const titles:
    Record<
      SettingsSection,
      {
        eyebrow: string;
        title: string;
        description: string;
      }
    > = {
    profile: {
      eyebrow: "Sua conta",
      title: "Perfil",
      description:
        "Gerencie suas informações pessoais.",
    },
    preferences: {
      eyebrow: "Comportamento",
      title: "Preferências",
      description:
        "Ajuste como o Prumo funciona para você.",
    },
    security: {
      eyebrow: "Proteção",
      title: "Segurança",
      description:
        "Controle senha e dispositivos conectados.",
    },
    appearance: {
      eyebrow: "Personalização",
      title: "Aparência",
      description:
        "Escolha como o Prumo deve se apresentar.",
    },
  };

  const heading = titles[section];


  return (
    <div className={styles.page}>
      <header
        className={styles.pageHeader}
      >
        <div>
          <span
            className={
              styles.eyebrow
            }
          >
            {heading.eyebrow}
          </span>

          <h1>{heading.title}</h1>

          <p>
            {heading.description}
          </p>
        </div>

        <div
          className={
            styles.accountChip
          }
        >
          <span>
            {initials(
              user?.name ?? "U",
            )}
          </span>

          <div>
            <strong>
              {user?.name}
            </strong>
            <small>
              {user?.email}
            </small>
          </div>
        </div>
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

      <div
        className={
          styles.settingsGrid
        }
      >
        <aside>
          <SettingsNavigation />
        </aside>

        <main>
          {isLoading ? (
            <Card>
              <PageState
                title="Carregando configurações"
                description="Preparando suas preferências."
              />
            </Card>
          ) : section === "profile"
            ? renderProfile()
            : section
              === "preferences"
              ? renderPreferences()
              : section
                === "security"
                ? renderSecurity()
                : renderAppearance()}
        </main>
      </div>
    </div>
  );
}
