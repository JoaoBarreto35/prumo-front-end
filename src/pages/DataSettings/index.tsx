import type {
  ChangeEvent,
} from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Modal } from "../../components/Modal";
import { PageSkeleton } from "../../components/PageSkeleton";
import { PageState } from "../../components/PageState";
import { SettingsNavigation } from "../../components/SettingsNavigation";
import { useAuth } from "../../contexts/AuthContext";
import { useAppLogout } from "../../hooks/useAppLogout";
import { ApiError } from "../../services/api";
import {
  dataManagementService,
} from "../../services/dataManagementService";
import type {
  DataImportCounts,
  DataImportFormat,
  DataImportPreview,
  DataImportRequest,
  DataOperationLog,
  DataSummary,
} from "../../types/dataManagement";

import styles from "./styles.module.css";


type DangerAction =
  | "clear"
  | "delete"
  | null;


const actionLabels:
  Record<string, string> = {
    export_backup:
      "Backup exportado",
    export_csv:
      "CSV exportado",
    import_backup:
      "Backup restaurado",
    import_csv:
      "CSV importado",
    clear_financial_data:
      "Dados financeiros apagados",
    import:
      "Falha na importação",
  };


function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "Sem movimentações";
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
  ).format(
    new Date(
      `${value.slice(0, 10)}T12:00:00`,
    ),
  );
}


function formatDateTime(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(new Date(value));
}


function detectFormat(
  file: File,
): DataImportFormat {
  const name =
    file.name.toLowerCase();

  if (name.endsWith(".csv")) {
    return "csv";
  }

  return "prumo_backup";
}


function emptyRequest():
  DataImportRequest {
  return {
    data_format:
      "prumo_backup",
    content: "",
    filename: null,
    mode: "merge",
    skip_duplicates: true,
    create_missing_structure:
      true,
    confirm_replace: false,
    current_password: null,
  };
}


function countEntries(
  values: DataImportCounts,
): number {
  return Object.values(values)
    .reduce(
      (
        total,
        current,
      ) =>
        total + current,
      0,
    );
}


export function DataSettingsPage() {
  const {
    user,
  } = useAuth();

  const {
    isLoggingOut,
    performLogout,
  } = useAppLogout();

  const [summary, setSummary] =
    useState<
      DataSummary | null
    >(null);

  const [history, setHistory] =
    useState<
      DataOperationLog[]
    >([]);

  const [request, setRequest] =
    useState<
      DataImportRequest
    >(
      emptyRequest(),
    );

  const [preview, setPreview] =
    useState<
      DataImportPreview | null
    >(null);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(
      null,
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [runningAction, setRunningAction] =
    useState<string | null>(
      null,
    );

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [dangerAction, setDangerAction] =
    useState<DangerAction>(
      null,
    );

  const [dangerPassword, setDangerPassword] =
    useState("");

  const [dangerEmail, setDangerEmail] =
    useState("");

  const [dangerConfirmation, setDangerConfirmation] =
    useState("");


  const loadData =
    useCallback(async () => {
      setIsLoading(true);
      setError("");

      try {
        const [
          summaryResult,
          historyResult,
        ] = await Promise.all([
          dataManagementService
            .getSummary(),
          dataManagementService
            .listHistory(),
        ]);

        setSummary(
          summaryResult,
        );
        setHistory(
          historyResult,
        );
      } catch (caughtError) {
        setError(
          caughtError
          instanceof ApiError
            ? caughtError.message
            : "Não foi possível carregar seus dados.",
        );
      } finally {
        setIsLoading(false);
      }
    }, []);


  useEffect(() => {
    void loadData();
  }, [loadData]);


  const canPreview =
    Boolean(
      selectedFile
      && request.content,
    );

  const totalWillCreate =
    useMemo(
      () =>
        preview
          ? countEntries(
              preview
                .will_create,
            )
          : 0,
      [preview],
    );


  function showError(
    caughtError: unknown,
    fallback: string,
  ) {
    setError(
      caughtError
      instanceof ApiError
        ? caughtError.message
        : fallback,
    );
  }


  async function exportBackup() {
    setRunningAction(
      "backup",
    );
    setError("");
    setSuccess("");

    try {
      await dataManagementService
        .exportBackup();

      setSuccess(
        "Backup completo gerado.",
      );

      const historyResult =
        await dataManagementService
          .listHistory();

      setHistory(
        historyResult,
      );
    } catch (caughtError) {
      showError(
        caughtError,
        "Não foi possível gerar o backup.",
      );
    } finally {
      setRunningAction(null);
    }
  }


  async function exportCsv() {
    setRunningAction("csv");
    setError("");
    setSuccess("");

    try {
      await dataManagementService
        .exportCsv();

      setSuccess(
        "CSV de movimentações gerado.",
      );

      const historyResult =
        await dataManagementService
          .listHistory();

      setHistory(
        historyResult,
      );
    } catch (caughtError) {
      showError(
        caughtError,
        "Não foi possível gerar o CSV.",
      );
    } finally {
      setRunningAction(null);
    }
  }


  async function selectFile(
    file: File | null,
  ) {
    setSelectedFile(file);
    setPreview(null);
    setError("");
    setSuccess("");

    if (!file) {
      setRequest(
        emptyRequest(),
      );
      return;
    }

    if (
      file.size
      > 20_000_000
    ) {
      setError(
        "O arquivo deve ter no máximo 20 MB.",
      );
      return;
    }

    try {
      const content =
        await file.text();

      setRequest(
        (current) => ({
          ...current,
          data_format:
            detectFormat(file),
          content,
          filename: file.name,
        }),
      );
    } catch {
      setError(
        "Não foi possível ler o arquivo.",
      );
    }
  }


  async function calculatePreview() {
    if (!canPreview) {
      return;
    }

    setRunningAction(
      "preview",
    );
    setError("");
    setSuccess("");

    try {
      const result =
        await dataManagementService
          .previewImport(
            request,
          );

      setPreview(result);

      if (!result.valid) {
        setError(
          result.errors.join(" "),
        );
      }
    } catch (caughtError) {
      showError(
        caughtError,
        "Não foi possível validar o arquivo.",
      );
    } finally {
      setRunningAction(null);
    }
  }


  async function applyImport() {
    if (
      !preview
      || !preview.valid
    ) {
      return;
    }

    if (
      request.mode
      === "replace"
      && !window.confirm(
        "Substituir todos os dados financeiros atuais pelos dados deste arquivo?",
      )
    ) {
      return;
    }

    setRunningAction(
      "import",
    );
    setError("");
    setSuccess("");

    try {
      const result =
        await dataManagementService
          .applyImport(
            request,
          );

      setSuccess(
        result.message,
      );
      setPreview(null);
      setSelectedFile(null);
      setRequest(
        emptyRequest(),
      );

      await loadData();
    } catch (caughtError) {
      showError(
        caughtError,
        "Não foi possível importar o arquivo.",
      );
    } finally {
      setRunningAction(null);
    }
  }


  function openDangerModal(
    action: Exclude<
      DangerAction,
      null
    >,
  ) {
    setDangerAction(action);
    setDangerPassword("");
    setDangerEmail(
      user?.email ?? "",
    );
    setDangerConfirmation("");
    setError("");
    setSuccess("");
  }


  function closeDangerModal() {
    if (
      runningAction
    ) {
      return;
    }

    setDangerAction(null);
    setDangerPassword("");
    setDangerConfirmation("");
  }


  async function clearFinancialData() {
    setRunningAction(
      "clear",
    );
    setError("");

    try {
      const result =
        await dataManagementService
          .clearFinancialData(
            dangerPassword,
            dangerConfirmation,
          );

      setSuccess(
        result.message,
      );
      setDangerAction(null);
      setDangerPassword("");
      setDangerConfirmation("");
      await loadData();
    } catch (caughtError) {
      showError(
        caughtError,
        "Não foi possível apagar os dados financeiros.",
      );
    } finally {
      setRunningAction(null);
    }
  }


  async function deleteAccount() {
    setRunningAction(
      "delete",
    );
    setError("");

    try {
      await dataManagementService
        .deleteAccount(
          dangerPassword,
          dangerEmail,
          dangerConfirmation,
        );

      await performLogout();
    } catch (caughtError) {
      showError(
        caughtError,
        "Não foi possível excluir a conta.",
      );
      setRunningAction(null);
    }
  }


  if (isLoading) {
    return <PageSkeleton />;
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
            Portabilidade e privacidade
          </span>

          <h1>
            Dados e backup
          </h1>

          <p>
            Exporte, importe ou remova
            seus dados com segurança.
          </p>
        </div>

        <div
          className={
            styles.accountChip
          }
        >
          <span>
            {user?.name
              ?.split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map(
                (part) =>
                  part[0],
              )
              .join("")
              .toUpperCase()
              || "U"}
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
        <div
          className={styles.error}
          role="alert"
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

      <div
        className={
          styles.settingsGrid
        }
      >
        <aside>
          <SettingsNavigation />
        </aside>

        <div
          className={styles.stack}
        >
          {summary ? (
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
                  <span>Contas</span>
                  <strong>
                    {summary.accounts}
                  </strong>
                </div>
              </Card>

              <Card>
                <div
                  className={
                    styles.metric
                  }
                >
                  <span>
                    Categorias
                  </span>
                  <strong>
                    {
                      summary
                        .categories
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
                  <span>
                    Movimentações
                  </span>
                  <strong>
                    {
                      summary
                        .transactions
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
                  <span>
                    Fechamentos
                  </span>
                  <strong>
                    {
                      summary
                        .closings
                    }
                  </strong>
                </div>
              </Card>
            </section>
          ) : null}

          {summary ? (
            <p
              className={
                styles.period
              }
            >
              Período dos dados:{" "}
              <strong>
                {formatDate(
                  summary
                    .first_transaction_date,
                )}
              </strong>
              {" até "}
              <strong>
                {formatDate(
                  summary
                    .last_transaction_date,
                )}
              </strong>
            </p>
          ) : null}

          <Card
            title="Exportar seus dados"
            description="Guarde uma cópia fora do Prumo quando quiser."
          >
            <div
              className={
                styles.exportGrid
              }
            >
              <article>
                <span
                  className={
                    styles.fileIcon
                  }
                >
                  {`{}`}
                </span>

                <div>
                  <strong>
                    Backup completo
                  </strong>

                  <p>
                    Contas, categorias,
                    grupos, parcelas,
                    recorrências,
                    fechamentos e
                    preferências.
                  </p>
                </div>

                <Button
                  variant="secondary"
                  isLoading={
                    runningAction
                    === "backup"
                  }
                  disabled={
                    runningAction
                    !== null
                  }
                  onClick={() =>
                    void exportBackup()
                  }
                >
                  Baixar JSON
                </Button>
              </article>

              <article>
                <span
                  className={
                    styles.fileIcon
                  }
                >
                  CSV
                </span>

                <div>
                  <strong>
                    Movimentações
                  </strong>

                  <p>
                    Formato tabular para
                    Excel, Power BI ou
                    análise externa.
                  </p>
                </div>

                <Button
                  variant="secondary"
                  isLoading={
                    runningAction
                    === "csv"
                  }
                  disabled={
                    runningAction
                    !== null
                  }
                  onClick={() =>
                    void exportCsv()
                  }
                >
                  Baixar CSV
                </Button>
              </article>
            </div>

            <aside
              className={
                styles.privacyNote
              }
            >
              Senha, tokens e sessões
              nunca são incluídos nos
              arquivos exportados.
            </aside>
          </Card>

          <Card
            title="Importar ou restaurar"
            description="O Prumo valida o arquivo antes de alterar qualquer dado."
          >
            <div
              className={
                styles.importForm
              }
            >
              <label
                className={
                  styles.filePicker
                }
              >
                <input
                  type="file"
                  accept=".json,.csv,application/json,text/csv"
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    void selectFile(
                      event.target
                        .files?.[0]
                      ?? null,
                    )
                  }
                />

                <span>
                  <strong>
                    {selectedFile
                      ? selectedFile.name
                      : "Escolher arquivo"}
                  </strong>

                  <small>
                    JSON do Prumo ou CSV
                    de até 20 MB
                  </small>
                </span>
              </label>

              <fieldset
                className={
                  styles.modeFieldset
                }
              >
                <legend>
                  Como importar?
                </legend>

                <label
                  className={
                    request.mode
                    === "merge"
                      ? styles
                          .modeActive
                      : styles.mode
                  }
                >
                  <input
                    type="radio"
                    name="import-mode"
                    checked={
                      request.mode
                      === "merge"
                    }
                    onChange={() => {
                      setPreview(null);
                      setRequest(
                        (current) => ({
                          ...current,
                          mode: "merge",
                          confirm_replace:
                            false,
                          current_password:
                            null,
                        }),
                      );
                    }}
                  />

                  <span>
                    <strong>
                      Mesclar
                    </strong>
                    <small>
                      Mantém os dados
                      atuais e adiciona o
                      que não existe.
                    </small>
                  </span>
                </label>

                <label
                  className={
                    request.mode
                    === "replace"
                      ? styles
                          .modeDanger
                      : styles.mode
                  }
                >
                  <input
                    type="radio"
                    name="import-mode"
                    checked={
                      request.mode
                      === "replace"
                    }
                    onChange={() => {
                      setPreview(null);
                      setRequest(
                        (current) => ({
                          ...current,
                          mode: "replace",
                          confirm_replace:
                            true,
                        }),
                      );
                    }}
                  />

                  <span>
                    <strong>
                      Substituir
                    </strong>
                    <small>
                      Apaga os dados
                      financeiros atuais
                      antes de restaurar.
                    </small>
                  </span>
                </label>
              </fieldset>

              <div
                className={
                  styles.options
                }
              >
                <label>
                  <input
                    type="checkbox"
                    checked={
                      request
                        .skip_duplicates
                    }
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      setPreview(null);
                      setRequest(
                        (current) => ({
                          ...current,
                          skip_duplicates:
                            event.target
                              .checked,
                        }),
                      );
                    }}
                  />

                  Ignorar grupos
                  duplicados
                </label>

                {request.data_format
                === "csv" ? (
                  <label>
                    <input
                      type="checkbox"
                      checked={
                        request
                          .create_missing_structure
                      }
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        setPreview(null);
                        setRequest(
                          (current) => ({
                            ...current,
                            create_missing_structure:
                              event.target
                                .checked,
                          }),
                        );
                      }}
                    />

                    Criar contas e
                    categorias ausentes
                  </label>
                ) : null}
              </div>

              {request.mode
              === "replace" ? (
                <label
                  className={
                    styles.passwordField
                  }
                >
                  <span>
                    Senha atual
                  </span>

                  <input
                    type="password"
                    autoComplete="current-password"
                    value={
                      request
                        .current_password
                      ?? ""
                    }
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setRequest(
                        (current) => ({
                          ...current,
                          current_password:
                            event.target
                              .value,
                        }),
                      )
                    }
                  />
                </label>
              ) : null}

              <div
                className={
                  styles.importActions
                }
              >
                <Button
                  variant="secondary"
                  isLoading={
                    runningAction
                    === "preview"
                  }
                  disabled={
                    !canPreview
                    || runningAction
                    !== null
                  }
                  onClick={() =>
                    void calculatePreview()
                  }
                >
                  Calcular prévia
                </Button>
              </div>
            </div>

            {preview ? (
              <section
                className={
                  styles.preview
                }
              >
                <header>
                  <div>
                    <span>
                      Resultado da análise
                    </span>

                    <strong>
                      {preview.valid
                        ? "Arquivo válido"
                        : "Arquivo com problemas"}
                    </strong>
                  </div>

                  <span
                    className={
                      preview.valid
                        ? styles
                            .validBadge
                        : styles
                            .invalidBadge
                    }
                  >
                    {preview.valid
                      ? "Pronto"
                      : "Revisar"}
                  </span>
                </header>

                <div
                  className={
                    styles.previewGrid
                  }
                >
                  <article>
                    <span>
                      Contas
                    </span>
                    <strong>
                      {
                        preview
                          .counts
                          .accounts
                      }
                    </strong>
                    <small>
                      {
                        preview
                          .duplicates
                          .accounts
                      }{" "}
                      já existentes
                    </small>
                  </article>

                  <article>
                    <span>
                      Categorias
                    </span>
                    <strong>
                      {
                        preview
                          .counts
                          .categories
                      }
                    </strong>
                    <small>
                      {
                        preview
                          .duplicates
                          .categories
                      }{" "}
                      já existentes
                    </small>
                  </article>

                  <article>
                    <span>
                      Grupos
                    </span>
                    <strong>
                      {
                        preview
                          .counts
                          .groups
                      }
                    </strong>
                    <small>
                      {
                        preview
                          .duplicates
                          .groups
                      }{" "}
                      duplicados
                    </small>
                  </article>

                  <article>
                    <span>
                      Movimentações
                    </span>
                    <strong>
                      {
                        preview
                          .counts
                          .transactions
                      }
                    </strong>
                    <small>
                      {totalWillCreate}{" "}
                      registros previstos
                    </small>
                  </article>
                </div>

                {preview.warnings
                  .length > 0 ? (
                  <div
                    className={
                      styles.warningList
                    }
                  >
                    {preview.warnings.map(
                      (warning) => (
                        <p key={warning}>
                          {warning}
                        </p>
                      ),
                    )}
                  </div>
                ) : null}

                {preview.errors
                  .length > 0 ? (
                  <div
                    className={
                      styles.errorList
                    }
                  >
                    {preview.errors.map(
                      (previewError) => (
                        <p
                          key={
                            previewError
                          }
                        >
                          {previewError}
                        </p>
                      ),
                    )}
                  </div>
                ) : null}

                {preview.sample
                  .length > 0 ? (
                  <div
                    className={
                      styles.sample
                    }
                  >
                    <strong>
                      Amostra
                    </strong>

                    {preview.sample.map(
                      (
                        item,
                        index,
                      ) => (
                        <div
                          key={`${String(
                            item.description
                            ?? "registro",
                          )}-${index}`}
                        >
                          <span>
                            {String(
                              item.description
                              ?? "Registro",
                            )}
                          </span>

                          <small>
                            {String(
                              item.due_date
                              ?? item.start_date
                              ?? "",
                            )}
                          </small>

                          <strong>
                            {String(
                              item.amount
                              ?? "",
                            )}
                          </strong>
                        </div>
                      ),
                    )}
                  </div>
                ) : null}

                <div
                  className={
                    styles.importActions
                  }
                >
                  <Button
                    isLoading={
                      runningAction
                      === "import"
                    }
                    disabled={
                      !preview.valid
                      || runningAction
                      !== null
                      || (
                        request.mode
                        === "replace"
                        && !request
                          .current_password
                      )
                    }
                    onClick={() =>
                      void applyImport()
                    }
                  >
                    {request.mode
                    === "replace"
                      ? "Substituir dados"
                      : "Importar dados"}
                  </Button>
                </div>
              </section>
            ) : null}
          </Card>

          <Card
            title="Histórico"
            description="Últimas exportações, importações e limpezas."
          >
            {history.length === 0 ? (
              <PageState
                title="Nenhuma operação"
                description="As operações de dados aparecerão aqui."
              />
            ) : (
              <div
                className={
                  styles.historyList
                }
              >
                {history.map(
                  (item) => (
                    <article
                      key={item.id}
                    >
                      <span
                        className={
                          item.status
                          === "success"
                            ? styles
                                .historySuccess
                            : styles
                                .historyError
                        }
                      >
                        {item.status
                        === "success"
                          ? "✓"
                          : "!"}
                      </span>

                      <div>
                        <strong>
                          {actionLabels[
                            item.action
                          ]
                          ?? item.action}
                        </strong>

                        <small>
                          {item.data_format}
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
            )}
          </Card>

          <Card
            title="Zona de perigo"
            description="Estas ações são permanentes e exigem sua senha."
          >
            <div
              className={
                styles.dangerList
              }
            >
              <article>
                <div>
                  <strong>
                    Apagar dados
                    financeiros
                  </strong>

                  <p>
                    Remove movimentações,
                    grupos, contas,
                    categorias e
                    fechamentos. Seu
                    login permanece.
                  </p>
                </div>

                <Button
                  variant="danger"
                  onClick={() =>
                    openDangerModal(
                      "clear",
                    )
                  }
                >
                  Apagar dados
                </Button>
              </article>

              <article>
                <div>
                  <strong>
                    Excluir minha conta
                  </strong>

                  <p>
                    Remove perfil, dados
                    financeiros, sessões
                    e acesso ao Prumo.
                  </p>
                </div>

                <Button
                  variant="danger"
                  onClick={() =>
                    openDangerModal(
                      "delete",
                    )
                  }
                >
                  Excluir conta
                </Button>
              </article>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        title={
          dangerAction === "clear"
            ? "Apagar dados financeiros"
            : "Excluir minha conta"
        }
        description={
          dangerAction === "clear"
            ? "Seu login será mantido, mas os dados financeiros serão removidos."
            : "Esta ação encerra sua conta definitivamente."
        }
        isOpen={
          dangerAction !== null
        }
        onClose={
          closeDangerModal
        }
      >
        <div
          className={
            styles.dangerModal
          }
        >
          <aside>
            Faça um backup antes de
            continuar. Esta ação não
            pode ser desfeita pelo
            suporte.
          </aside>

          {dangerAction
          === "delete" ? (
            <label>
              <span>
                Confirme seu e-mail
              </span>

              <input
                type="email"
                value={dangerEmail}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setDangerEmail(
                    event.target
                      .value,
                  )
                }
              />
            </label>
          ) : null}

          <label>
            <span>
              Senha atual
            </span>

            <input
              type="password"
              autoComplete="current-password"
              value={dangerPassword}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setDangerPassword(
                  event.target
                    .value,
                )
              }
            />
          </label>

          <label>
            <span>
              Digite{" "}
              <strong>
                {dangerAction
                === "clear"
                  ? "APAGAR MEUS DADOS"
                  : "EXCLUIR MINHA CONTA"}
              </strong>
            </span>

            <input
              type="text"
              value={
                dangerConfirmation
              }
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setDangerConfirmation(
                  event.target
                    .value,
                )
              }
            />
          </label>

          <div
            className={
              styles.modalActions
            }
          >
            <Button
              variant="secondary"
              disabled={
                runningAction
                !== null
              }
              onClick={
                closeDangerModal
              }
            >
              Cancelar
            </Button>

            <Button
              variant="danger"
              isLoading={
                runningAction
                === dangerAction
                || isLoggingOut
              }
              disabled={
                !dangerPassword
                || !dangerConfirmation
              }
              onClick={() =>
                dangerAction
                === "clear"
                  ? void clearFinancialData()
                  : void deleteAccount()
              }
            >
              Confirmar ação
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
