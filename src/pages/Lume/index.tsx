import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  useLocation,
} from "react-router";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { PageState } from "../../components/PageState";
import { LumeIconLoader } from "../../components/LumeIconLoader";

import { ApiError } from "../../services/api";
import { lumeService } from "../../services/lumeService";
import type {
  LumeAction,
  LumeConversation,
  LumeMessage,
} from "../../types/lume";
import {
  formatCurrency,
} from "../../utils/currency";

import styles from "./styles.module.css";


type LocationState = {
  initialMessage?: string;
};


const initialSuggestions = [
  "Quanto ainda falta pagar este mês?",
  "Onde estou gastando mais?",
  "Posso assumir uma parcela de R$ 800?",
  "Simule uma compra de R$ 6.000 em 10 vezes.",
];


function formatDateTime(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(new Date(value));
}


function getActionTitle(
  action: LumeAction,
): string {
  if (
    action.kind
    === "create_planning_scenario"
  ) {
    return "Adicionar ao planejamento";
  }

  return "Criar movimentação";
}


function getPayloadString(
  payload: Record<
    string,
    unknown
  >,
  key: string,
): string | null {
  const value = payload[key];

  if (
    typeof value === "string"
    && value.trim()
  ) {
    return value;
  }

  return null;
}


function getPayloadNumber(
  payload: Record<
    string,
    unknown
  >,
  key: string,
): number | null {
  const value = payload[key];

  if (
    typeof value === "number"
  ) {
    return value;
  }

  if (
    typeof value === "string"
    && value.trim()
    && !Number.isNaN(
      Number(value),
    )
  ) {
    return Number(value);
  }

  return null;
}


function groupTypeLabel(
  value: string | null,
): string {
  if (value === "installment") {
    return "Parcelada";
  }

  if (value === "recurring") {
    return "Recorrente";
  }

  return "Avulsa";
}


function ActionCard({
  action,
  isRunning,
  onConfirm,
  onCancel,
}: {
  action: LumeAction;
  isRunning: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const description =
    getPayloadString(
      action.payload,
      "description",
    );

  const amount =
    getPayloadNumber(
      action.payload,
      "amount",
    );

  const groupType =
    getPayloadString(
      action.payload,
      "group_type",
    );

  const accountName =
    getPayloadString(
      action.payload,
      "account_name",
    );

  const categoryName =
    getPayloadString(
      action.payload,
      "category_name",
    );

  const startDate =
    getPayloadString(
      action.payload,
      "start_date",
    );

  const occurrenceCount =
    getPayloadNumber(
      action.payload,
      "occurrence_count",
    );


  return (
    <div
      className={[
        styles.actionCard,
        styles[
          `action${action.status
            .charAt(0)
            .toUpperCase()}${action.status
            .slice(1)}`
        ],
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={
          styles.actionHeader
        }
      >
        <div>
          <span>
            Confirmação necessária
          </span>

          <strong>
            {getActionTitle(action)}
          </strong>
        </div>

        <span
          className={
            styles.actionStatus
          }
        >
          {action.status === "pending"
            ? "Pendente"
            : action.status === "confirmed"
              ? "Confirmada"
              : action.status === "cancelled"
                ? "Cancelada"
                : "Falhou"}
        </span>
      </div>

      <dl
        className={
          styles.actionDetails
        }
      >
        {description ? (
          <div>
            <dt>Descrição</dt>
            <dd>{description}</dd>
          </div>
        ) : null}

        {amount !== null ? (
          <div>
            <dt>Valor</dt>
            <dd>
              {formatCurrency(amount)}
            </dd>
          </div>
        ) : null}

        {groupType ? (
          <div>
            <dt>Formato</dt>
            <dd>
              {groupTypeLabel(
                groupType,
              )}
              {occurrenceCount
                ? ` · ${occurrenceCount} vezes`
                : ""}
            </dd>
          </div>
        ) : null}

        {accountName ? (
          <div>
            <dt>Conta</dt>
            <dd>{accountName}</dd>
          </div>
        ) : null}

        {categoryName ? (
          <div>
            <dt>Categoria</dt>
            <dd>{categoryName}</dd>
          </div>
        ) : null}

        {startDate ? (
          <div>
            <dt>Início</dt>
            <dd>
              {new Intl.DateTimeFormat(
                "pt-BR",
              ).format(
                new Date(
                  `${startDate}T12:00:00`,
                ),
              )}
            </dd>
          </div>
        ) : null}
      </dl>

      {action.status === "pending" ? (
        <div
          className={
            styles.actionButtons
          }
        >
          <Button
            variant="secondary"
            size="small"
            disabled={isRunning}
            onClick={onCancel}
          >
            Cancelar
          </Button>

          <Button
            size="small"
            isLoading={isRunning}
            onClick={onConfirm}
          >
            Confirmar
          </Button>
        </div>
      ) : null}
    </div>
  );
}


export function LumePage() {
  const location = useLocation();
  const state =
    location.state as LocationState | null;

  const [
    conversations,
    setConversations,
  ] = useState<LumeConversation[]>(
    [],
  );

  const [
    activeConversationId,
    setActiveConversationId,
  ] = useState<string | null>(
    null,
  );

  const [messages, setMessages] =
    useState<LumeMessage[]>([]);

  const [draft, setDraft] =
    useState(
      state?.initialMessage ?? "",
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSending, setIsSending] =
    useState(false);

  const [
    runningActionId,
    setRunningActionId,
  ] = useState<string | null>(
    null,
  );

  const [error, setError] =
    useState("");

  const messagesEndRef =
    useRef<HTMLDivElement | null>(
      null,
    );


  const loadConversations =
    useCallback(async () => {
      try {
        const data =
          await lumeService
            .listConversations();

        setConversations(data);
      } catch (caughtError) {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "Não foi possível carregar as conversas.",
        );
      }
    }, []);


  useEffect(() => {
    async function initialLoad() {
      setIsLoading(true);
      await loadConversations();
      setIsLoading(false);
    }

    void initialLoad();
  }, [loadConversations]);


  useEffect(() => {
    messagesEndRef.current
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }, [messages, isSending]);


  const latestSuggestions =
    useMemo(
      () => {
        const assistantMessages =
          [...messages]
            .reverse()
            .filter(
              (message) =>
                message.role
                === "assistant",
            );

        return (
          assistantMessages[0]
            ?.suggestions
          ?? []
        );
      },
      [messages],
    );


  async function openConversation(
    conversationId: string,
  ) {
    setError("");
    setActiveConversationId(
      conversationId,
    );
    setIsLoading(true);

    try {
      const data =
        await lumeService
          .listMessages(
            conversationId,
          );

      setMessages(data);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível abrir a conversa.",
      );
    } finally {
      setIsLoading(false);
    }
  }


  function startNewConversation() {
    setActiveConversationId(null);
    setMessages([]);
    setDraft("");
    setError("");
  }


  async function submitMessage(
    event?: FormEvent,
    directMessage?: string,
  ) {
    event?.preventDefault();

    const message = (
      directMessage ?? draft
    ).trim();

    if (!message || isSending) {
      return;
    }

    setError("");
    setDraft("");
    setIsSending(true);

    try {
      const response =
        await lumeService
          .sendMessage(
            message,
            activeConversationId,
          );

      setActiveConversationId(
        response.conversation_id,
      );

      setMessages(
        (current) => [
          ...current,
          response.user_message,
          response.assistant_message,
        ],
      );

      await loadConversations();
    } catch (caughtError) {
      setDraft(message);

      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível falar com o Lume.",
      );
    } finally {
      setIsSending(false);
    }
  }


  function updateActionStatus(
    messageId: string,
    status:
      | "confirmed"
      | "cancelled"
      | "failed",
    resultId?: string | null,
  ) {
    setMessages(
      (current) =>
        current.map(
          (message) => {
            if (
              message.id !== messageId
              || !message.action
            ) {
              return message;
            }

            return {
              ...message,
              action: {
                ...message.action,
                status,
                result_id:
                  resultId ?? null,
              },
            };
          },
        ),
    );
  }


  async function handleAction(
    action: LumeAction,
    decision:
      | "confirm"
      | "cancel",
  ) {
    setRunningActionId(
      action.message_id,
    );
    setError("");

    try {
      const result =
        decision === "confirm"
          ? await lumeService
              .confirmAction(
                action.message_id,
              )
          : await lumeService
              .cancelAction(
                action.message_id,
              );

      updateActionStatus(
        action.message_id,
        decision === "confirm"
          ? "confirmed"
          : "cancelled",
        result.result_id,
      );

      if (
        result.assistant_message
      ) {
        setMessages(
          (current) => [
            ...current,
            result.assistant_message as LumeMessage,
          ],
        );
      }

      await loadConversations();
    } catch (caughtError) {
      updateActionStatus(
        action.message_id,
        "failed",
      );

      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível executar a ação.",
      );
    } finally {
      setRunningActionId(null);
    }
  }


  async function removeActiveConversation() {
    if (
      !activeConversationId
      || !window.confirm(
        "Excluir esta conversa com o Lume?",
      )
    ) {
      return;
    }

    try {
      await lumeService
        .deleteConversation(
          activeConversationId,
        );

      startNewConversation();
      await loadConversations();
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível excluir a conversa.",
      );
    }
  }


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
            Assistente financeiro
          </span>

          <h1>Lume</h1>

          <p>
            Pergunte, analise e prepare
            ações usando seus próprios
            dados do Prumo.
          </p>
        </div>

        <Button
          onClick={
            startNewConversation
          }
        >
          Nova conversa
        </Button>
      </header>

      {error ? (
        <div
          className={styles.error}
        >
          {error}
        </div>
      ) : null}

      <div
        className={
          styles.workspace
        }
      >
        <aside
          className={
            styles.conversationPanel
          }
        >
          <div
            className={
              styles.panelHeader
            }
          >
            <strong>Conversas</strong>
            <span>
              {conversations.length}
            </span>
          </div>

          {conversations.length
          === 0 ? (
            <p
              className={
                styles.emptyHistory
              }
            >
              Suas conversas aparecerão
              aqui.
            </p>
          ) : (
            <div
              className={
                styles.conversationList
              }
            >
              {conversations.map(
                (conversation) => (
                  <button
                    type="button"
                    key={conversation.id}
                    className={[
                      styles
                        .conversationItem,
                      activeConversationId
                      === conversation.id
                        ? styles
                            .conversationActive
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() =>
                      void openConversation(
                        conversation.id,
                      )
                    }
                  >
                    <strong>
                      {conversation.title}
                    </strong>

                    <span>
                      {
                        conversation
                          .message_count
                      }{" "}
                      mensagens ·{" "}
                      {formatDateTime(
                        conversation
                          .last_message_at,
                      )}
                    </span>
                  </button>
                ),
              )}
            </div>
          )}
        </aside>

        <Card>
          <section
            className={
              styles.chat
            }
          >
            <div
              className={
                styles.chatHeader
              }
            >
              <div
                className={
                  styles.lumeIdentity
                }
              >
                <span>✦</span>

                <div>
                  <strong>Lume</strong>
                  <small>
                    Dados do Prumo · ações
                    com confirmação
                  </small>
                </div>
              </div>

              {activeConversationId ? (
                <Button
                  variant="tertiary"
                  size="small"
                  onClick={() =>
                    void removeActiveConversation()
                  }
                >
                  Excluir conversa
                </Button>
              ) : null}
            </div>

            <div
              className={
                styles.messages
              }
            >
              {isLoading ? (
                <Card>
                <LumeIconLoader
                title="Carregando conversas"
              />
              </Card>
              ) : messages.length
              === 0 ? (
                <div
                  className={
                    styles.welcome
                  }
                >
                  <span
                    className={
                      styles.welcomeIcon
                    }
                  >
                    ✦
                  </span>

                  <h2>
                    O que vamos aprumar?
                  </h2>

                  <p>
                    Posso analisar seus
                    gastos, responder sobre
                    prazos e preparar
                    movimentações ou
                    simulações.
                  </p>

                  <div
                    className={
                      styles
                        .initialSuggestions
                    }
                  >
                    {initialSuggestions.map(
                      (suggestion) => (
                        <button
                          type="button"
                          key={suggestion}
                          onClick={() =>
                            void submitMessage(
                              undefined,
                              suggestion,
                            )
                          }
                        >
                          {suggestion}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              ) : (
                messages.map(
                  (message) => (
                    <article
                      className={[
                        styles.message,
                        message.role
                        === "user"
                          ? styles
                              .userMessage
                          : styles
                              .assistantMessage,
                      ].join(" ")}
                      key={message.id}
                    >
                      <div
                        className={
                          styles
                            .messageHeader
                        }
                      >
                        <strong>
                          {message.role
                          === "user"
                            ? "Você"
                            : "Lume"}
                        </strong>

                        <span>
                          {formatDateTime(
                            message
                              .created_at,
                          )}
                        </span>
                      </div>

                      <p>
                        {message.content}
                      </p>

                      {message.action ? (
                        <ActionCard
                          action={
                            message.action
                          }
                          isRunning={
                            runningActionId
                            === message
                              .action
                              .message_id
                          }
                          onConfirm={() =>
                            void handleAction(
                              message.action as LumeAction,
                              "confirm",
                            )
                          }
                          onCancel={() =>
                            void handleAction(
                              message.action as LumeAction,
                              "cancel",
                            )
                          }
                        />
                      ) : null}
                    </article>
                  ),
                )
              )}

              {isSending ? (
                <article
                  className={[
                    styles.message,
                    styles
                      .assistantMessage,
                    styles.typing,
                  ].join(" ")}
                >
                  <span />
                  <span />
                  <span />
                </article>
              ) : null}

              <div
                ref={messagesEndRef}
              />
            </div>

            {latestSuggestions.length
            > 0 ? (
              <div
                className={
                  styles
                    .followUpSuggestions
                }
              >
                {latestSuggestions.map(
                  (suggestion) => (
                    <button
                      type="button"
                      key={suggestion}
                      disabled={isSending}
                      onClick={() =>
                        void submitMessage(
                          undefined,
                          suggestion,
                        )
                      }
                    >
                      {suggestion}
                    </button>
                  ),
                )}
              </div>
            ) : null}

            <form
              className={
                styles.composer
              }
              onSubmit={(event) =>
                void submitMessage(
                  event,
                )
              }
            >
              <textarea
                value={draft}
                maxLength={4000}
                placeholder="Pergunte sobre sua vida financeira..."
                disabled={isSending}
                onChange={(event) =>
                  setDraft(
                    event.target.value,
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter"
                    && !event.shiftKey
                  ) {
                    event.preventDefault();
                    void submitMessage();
                  }
                }}
              />

              <div
                className={
                  styles.composerFooter
                }
              >
                <span>
                  O Lume não altera nada
                  sem sua confirmação.
                </span>

                <Button
                  type="submit"
                  isLoading={isSending}
                  disabled={
                    !draft.trim()
                  }
                >
                  Enviar
                </Button>
              </div>
            </form>
          </section>
        </Card>
      </div>
    </div>
  );
}
