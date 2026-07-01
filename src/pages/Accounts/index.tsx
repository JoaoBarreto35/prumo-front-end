import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { Modal } from "../../components/Modal";
import { PageSkeleton } from "../../components/PageSkeleton";
import { PageState } from "../../components/PageState";
import { accountService } from "../../services/accountService";
import { ApiError } from "../../services/api";
import type {
  Account,
  AccountCreateInput,
  AccountType,
  StructureImpact,
} from "../../types/finance";

import styles from "./styles.module.css";


type DataAction =
  | "transfer"
  | "delete";


const accountTypeLabels:
  Record<AccountType, string> = {
    immediate_payment:
      "Pagamento imediato",
    credit_card:
      "Cartão de crédito",
    third_party_credit:
      "Crédito de terceiro",
    cash: "Dinheiro",
    other: "Outro",
  };


const initialForm:
  AccountCreateInput = {
    name: "",
    type: "immediate_payment",
    is_default: false,
    closing_day: null,
    due_day: null,
  };


function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
  ).format(
    new Date(
      `${value}T12:00:00`,
    ),
  );
}


function formatMonth(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      month: "long",
      year: "numeric",
    },
  ).format(
    new Date(
      `${value.slice(0, 7)}-01T12:00:00`,
    ),
  );
}


export function AccountsPage() {
  const [accounts, setAccounts] =
    useState<Account[]>([]);

  const [form, setForm] =
    useState(initialForm);

  const [editingAccount, setEditingAccount] =
    useState<Account | null>(null);

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [formError, setFormError] =
    useState("");

  const [actionId, setActionId] =
    useState<string | null>(null);

  const [archiveTarget, setArchiveTarget] =
    useState<Account | null>(null);

  const [replacementDefaultId, setReplacementDefaultId] =
    useState("");

  const [managedAccount, setManagedAccount] =
    useState<Account | null>(null);

  const [impact, setImpact] =
    useState<StructureImpact | null>(null);

  const [isImpactLoading, setIsImpactLoading] =
    useState(false);

  const [dataAction, setDataAction] =
    useState<DataAction>("transfer");

  const [targetAccountId, setTargetAccountId] =
    useState("");

  const [confirmClosedMonths, setConfirmClosedMonths] =
    useState(false);

  const [deleteConfirmation, setDeleteConfirmation] =
    useState("");

  const [operationError, setOperationError] =
    useState("");


  const activeAccounts = useMemo(
    () =>
      accounts.filter(
        (account) => account.is_active,
      ),
    [accounts],
  );

  const inactiveAccounts = useMemo(
    () =>
      accounts.filter(
        (account) => !account.is_active,
      ),
    [accounts],
  );

  const availableTargets = useMemo(
    () =>
      activeAccounts.filter(
        (account) =>
          account.id
          !== managedAccount?.id
          && account.id
          !== archiveTarget?.id,
      ),
    [
      activeAccounts,
      archiveTarget,
      managedAccount,
    ],
  );


  const loadAccounts = useCallback(
    async () => {
      setError("");
      setIsLoading(true);

      try {
        const result =
          await accountService.list();

        setAccounts(result);
      } catch (caughtError) {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "Não foi possível carregar as contas.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );


  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);


  function openCreate() {
    setEditingAccount(null);
    setForm(initialForm);
    setFormError("");
    setIsFormOpen(true);
  }


  function openEdit(
    account: Account,
  ) {
    setEditingAccount(account);
    setForm({
      name: account.name,
      type: account.type,
      is_default:
        account.is_default,
      closing_day:
        account.closing_day,
      due_day: account.due_day,
    });
    setFormError("");
    setIsFormOpen(true);
  }


  function changeType(
    type: AccountType,
  ) {
    const isCredit =
      type === "credit_card"
      || type
        === "third_party_credit";

    setForm((current) => ({
      ...current,
      type,
      closing_day: isCredit
        ? current.closing_day
        : null,
      due_day: isCredit
        ? current.due_day
        : null,
    }));
  }


  async function submitForm(
    event: FormEvent,
  ) {
    event.preventDefault();
    setFormError("");

    const requiresDays =
      form.type === "credit_card"
      || form.type
        === "third_party_credit";

    if (!form.name.trim()) {
      setFormError(
        "Informe o nome da conta.",
      );
      return;
    }

    if (
      requiresDays
      && (
        !form.closing_day
        || !form.due_day
      )
    ) {
      setFormError(
        "Informe os dias de fechamento e vencimento.",
      );
      return;
    }

    setIsSaving(true);

    try {
      if (editingAccount) {
        await accountService.update(
          editingAccount.id,
          {
            name: form.name.trim(),
            type: form.type,
            closing_day:
              form.closing_day,
            due_day: form.due_day,
          },
        );
      } else {
        await accountService.create({
          ...form,
          name: form.name.trim(),
        });
      }

      setIsFormOpen(false);
      await loadAccounts();

      window.alert(
        editingAccount
          ? "Conta atualizada com sucesso."
          : "Conta criada com sucesso.",
      );
    } catch (caughtError) {
      setFormError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível salvar a conta.",
      );
    } finally {
      setIsSaving(false);
    }
  }


  async function setDefault(
    account: Account,
  ) {
    setActionId(account.id);

    try {
      await accountService.setDefault(
        account.id,
      );
      await loadAccounts();
      window.alert(
        `${account.name} agora é a conta padrão.`,
      );
    } catch (caughtError) {
      window.alert(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível alterar a conta padrão.",
      );
    } finally {
      setActionId(null);
    }
  }


  async function activate(
    account: Account,
  ) {
    setActionId(account.id);

    try {
      await accountService.activate(
        account.id,
      );
      await loadAccounts();
      window.alert(
        "Conta reativada com sucesso.",
      );
    } catch (caughtError) {
      window.alert(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível reativar a conta.",
      );
    } finally {
      setActionId(null);
    }
  }


  function requestArchive(
    account: Account,
  ) {
    if (
      account
        .active_recurring_group_count
      > 0
    ) {
      window.alert(
        "Esta conta possui recorrências ativas. Transfira os dados ou desative as recorrências antes de arquivar.",
      );
      return;
    }

    if (account.is_default) {
      setArchiveTarget(account);
      setReplacementDefaultId(
        activeAccounts.find(
          (item) =>
            item.id !== account.id,
        )?.id ?? "",
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Arquivar a conta "${account.name}"? Ela deixará de aparecer em novos lançamentos.`,
      );

    if (confirmed) {
      void archive(
        account,
        null,
      );
    }
  }


  async function archive(
    account: Account,
    replacementId: string | null,
  ) {
    setActionId(account.id);

    try {
      await accountService.archive(
        account.id,
        replacementId,
      );
      setArchiveTarget(null);
      await loadAccounts();
      window.alert(
        "Conta arquivada com sucesso.",
      );
    } catch (caughtError) {
      window.alert(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível arquivar a conta.",
      );
    } finally {
      setActionId(null);
    }
  }


  async function openDataManagement(
    account: Account,
  ) {
    setManagedAccount(account);
    setImpact(null);
    setOperationError("");
    setDataAction("transfer");
    setConfirmClosedMonths(false);
    setDeleteConfirmation("");
    setTargetAccountId(
      activeAccounts.find(
        (item) =>
          item.id !== account.id,
      )?.id ?? "",
    );
    setIsImpactLoading(true);

    try {
      const result =
        await accountService.impact(
          account.id,
        );

      setImpact(result);

      if (
        result.can_delete_without_transfer
      ) {
        setDataAction("delete");
      }
    } catch (caughtError) {
      setOperationError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível calcular o impacto.",
      );
    } finally {
      setIsImpactLoading(false);
    }
  }


  async function executeDataAction() {
    if (!managedAccount || !impact) {
      return;
    }

    if (
      dataAction === "transfer"
      && !targetAccountId
    ) {
      setOperationError(
        "Escolha a conta de destino.",
      );
      return;
    }

    if (
      dataAction === "delete"
      && deleteConfirmation
        !== managedAccount.name
    ) {
      setOperationError(
        "Digite exatamente o nome da conta para confirmar a exclusão.",
      );
      return;
    }

    if (
      dataAction === "delete"
      && (
        !impact
          .can_delete_without_transfer
        || managedAccount.is_default
      )
      && !targetAccountId
    ) {
      setOperationError(
        "Escolha a conta que receberá os dados antes da exclusão.",
      );
      return;
    }

    if (
      impact.closed_months.length
      > 0
      && !confirmClosedMonths
    ) {
      setOperationError(
        "Confirme que está ciente dos meses fechados afetados.",
      );
      return;
    }

    setActionId(managedAccount.id);
    setOperationError("");

    try {
      const result =
        dataAction === "transfer"
          ? await accountService.transfer(
              managedAccount.id,
              targetAccountId,
              confirmClosedMonths,
            )
          : await accountService.remove(
              managedAccount.id,
              targetAccountId || null,
              confirmClosedMonths,
            );

      setManagedAccount(null);
      await loadAccounts();
      window.alert(result.message);
    } catch (caughtError) {
      setOperationError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível concluir a operação.",
      );
    } finally {
      setActionId(null);
    }
  }


  function renderAccount(
    account: Account,
  ) {
    return (
      <article
        key={account.id}
        className={[
          styles.accountRow,
          !account.is_active
            ? styles.inactiveRow
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div
          className={
            styles.accountIdentity
          }
        >
          <span
            className={styles.accountIcon}
            aria-hidden="true"
          >
            {account.type
            === "credit_card"
              || account.type
                === "third_party_credit"
              ? "▣"
              : "●"}
          </span>

          <div>
            <div
              className={styles.titleLine}
            >
              <strong>{account.name}</strong>

              {account.is_default ? (
                <Badge variant="positive">
                  Padrão
                </Badge>
              ) : null}

              {!account.is_active ? (
                <Badge variant="neutral">
                  Arquivada
                </Badge>
              ) : null}
            </div>

            <span>
              {accountTypeLabels[
                account.type
              ]}
              {account.closing_day
                ? ` · fecha dia ${account.closing_day}`
                : ""}
              {account.due_day
                ? ` · vence dia ${account.due_day}`
                : ""}
            </span>
          </div>
        </div>

        <div className={styles.usage}>
          <span>
            <strong>
              {account.transaction_count}
            </strong>
            movimentações
          </span>

          <span>
            <strong>
              {account.group_count}
            </strong>
            grupos
          </span>

          {account
            .active_recurring_group_count
          > 0 ? (
            <span>
              <strong>
                {
                  account
                    .active_recurring_group_count
                }
              </strong>
              recorrências ativas
            </span>
          ) : null}
        </div>

        <div className={styles.rowActions}>
          <Button
            size="small"
            variant="tertiary"
            onClick={() =>
              openEdit(account)
            }
          >
            Editar
          </Button>

          <Button
            size="small"
            variant="secondary"
            onClick={() =>
              void openDataManagement(
                account,
              )
            }
          >
            Dados
          </Button>

          {account.is_active ? (
            <>
              {!account.is_default ? (
                <Button
                  size="small"
                  variant="secondary"
                  isLoading={
                    actionId
                    === account.id
                  }
                  onClick={() =>
                    void setDefault(
                      account,
                    )
                  }
                >
                  Tornar padrão
                </Button>
              ) : null}

              <Button
                size="small"
                variant="danger"
                disabled={
                  actionId !== null
                }
                onClick={() =>
                  requestArchive(
                    account,
                  )
                }
              >
                Arquivar
              </Button>
            </>
          ) : (
            <Button
              size="small"
              isLoading={
                actionId === account.id
              }
              onClick={() =>
                void activate(account)
              }
            >
              Reativar
            </Button>
          )}
        </div>
      </article>
    );
  }


  return (
    <div className={styles.page}>
      <header
        className={styles.pageHeader}
      >
        <div>
          <span
            className={styles.eyebrow}
          >
            Organização financeira
          </span>

          <h1>Contas</h1>

          <p>
            Edite, arquive, transfira ou
            mescle contas sem perder o
            histórico financeiro.
          </p>
        </div>

        <Button onClick={openCreate}>
          Nova conta
        </Button>
      </header>

      <section className={styles.summaryGrid}>
        <Card>
          <div className={styles.summary}>
            <span>Contas ativas</span>
            <strong>
              {activeAccounts.length}
            </strong>
          </div>
        </Card>

        <Card>
          <div className={styles.summary}>
            <span>Conta padrão</span>
            <strong>
              {accounts.find(
                (account) =>
                  account.is_default,
              )?.name ?? "Nenhuma"}
            </strong>
          </div>
        </Card>

        <Card>
          <div className={styles.summary}>
            <span>Movimentações vinculadas</span>
            <strong>
              {accounts.reduce(
                (total, account) =>
                  total
                  + account.transaction_count,
                0,
              )}
            </strong>
          </div>
        </Card>
      </section>

      {isLoading ? (
        <PageSkeleton
          cards={0}
          rows={6}
        />
      ) : error ? (
        <Card>
          <PageState
            title="Não foi possível carregar"
            description={error}
            actionLabel="Tentar novamente"
            onAction={() =>
              void loadAccounts()
            }
          />
        </Card>
      ) : accounts.length === 0 ? (
        <Card>
          <PageState
            title="Nenhuma conta cadastrada"
            description="Crie sua primeira conta para registrar movimentações."
            actionLabel="Criar conta"
            onAction={openCreate}
          />
        </Card>
      ) : (
        <Card
          title="Contas ativas"
          description="Alterar o nome atualiza os rótulos exibidos, sem recriar as movimentações."
        >
          <div className={styles.accountList}>
            {activeAccounts.map(
              renderAccount,
            )}
          </div>

          {inactiveAccounts.length > 0 ? (
            <section
              className={
                styles.inactiveSection
              }
            >
              <h2>Arquivadas</h2>

              <div
                className={
                  styles.accountList
                }
              >
                {inactiveAccounts.map(
                  renderAccount,
                )}
              </div>
            </section>
          ) : null}
        </Card>
      )}

      <Modal
        title={
          editingAccount
            ? "Editar conta"
            : "Nova conta"
        }
        description={
          editingAccount
            ? "Datas já geradas não são recalculadas ao trocar o tipo da conta."
            : "Configure como os lançamentos serão organizados."
        }
        isOpen={isFormOpen}
        onClose={() =>
          setIsFormOpen(false)
        }
      >
        <form
          className={styles.form}
          onSubmit={(event) =>
            void submitForm(event)
          }
        >
          {formError ? (
            <div
              className={styles.formError}
              role="alert"
            >
              {formError}
            </div>
          ) : null}

          <Input
            label="Nome"
            value={form.name}
            maxLength={100}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            required
          />

          <label
            className={styles.selectField}
          >
            <span>Tipo</span>

            <select
              value={form.type}
              onChange={(event) =>
                changeType(
                  event.target.value as AccountType,
                )
              }
            >
              {Object.entries(
                accountTypeLabels,
              ).map(([value, label]) => (
                <option
                  key={value}
                  value={value}
                >
                  {label}
                </option>
              ))}
            </select>
          </label>

          {form.type === "credit_card"
          || form.type
            === "third_party_credit" ? (
            <div
              className={styles.twoColumns}
            >
              <Input
                label="Dia de fechamento"
                type="number"
                min={1}
                max={31}
                value={
                  form.closing_day
                  ?? ""
                }
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    closing_day:
                      event.target.value
                        ? Number(
                            event.target.value,
                          )
                        : null,
                  }))
                }
                required
              />

              <Input
                label="Dia de vencimento"
                type="number"
                min={1}
                max={31}
                value={
                  form.due_day ?? ""
                }
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    due_day:
                      event.target.value
                        ? Number(
                            event.target.value,
                          )
                        : null,
                  }))
                }
                required
              />
            </div>
          ) : null}

          {!editingAccount ? (
            <label
              className={styles.checkbox}
            >
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    is_default:
                      event.target.checked,
                  }))
                }
              />

              <span>
                Usar como conta padrão para
                novos lançamentos
              </span>
            </label>
          ) : null}

          <div
            className={styles.formActions}
          >
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setIsFormOpen(false)
              }
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              isLoading={isSaving}
            >
              {editingAccount
                ? "Salvar alterações"
                : "Criar conta"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        title="Substituir conta padrão"
        description={
          archiveTarget
            ? `Escolha a conta padrão antes de arquivar ${archiveTarget.name}.`
            : undefined
        }
        isOpen={archiveTarget !== null}
        onClose={() =>
          setArchiveTarget(null)
        }
      >
        {archiveTarget ? (
          <div
            className={styles.archiveModal}
          >
            <label
              className={styles.selectField}
            >
              <span>Nova conta padrão</span>
              <select
                value={replacementDefaultId}
                onChange={(event) =>
                  setReplacementDefaultId(
                    event.target.value,
                  )
                }
              >
                <option value="">
                  Selecione
                </option>
                {availableTargets.map(
                  (account) => (
                    <option
                      key={account.id}
                      value={account.id}
                    >
                      {account.name}
                    </option>
                  ),
                )}
              </select>
            </label>

            <div
              className={styles.formActions}
            >
              <Button
                variant="secondary"
                onClick={() =>
                  setArchiveTarget(null)
                }
              >
                Cancelar
              </Button>

              <Button
                variant="danger"
                disabled={
                  !replacementDefaultId
                }
                isLoading={
                  actionId
                  === archiveTarget.id
                }
                onClick={() =>
                  void archive(
                    archiveTarget,
                    replacementDefaultId,
                  )
                }
              >
                Substituir e arquivar
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        title={
          managedAccount
            ? `Dados de ${managedAccount.name}`
            : "Gerenciar dados"
        }
        description="Transfira vínculos antes de excluir ou mesclar uma conta."
        isOpen={managedAccount !== null}
        onClose={() =>
          setManagedAccount(null)
        }
      >
        {managedAccount ? (
          <div
            className={styles.dataModal}
          >
            {operationError ? (
              <div
                className={styles.formError}
                role="alert"
              >
                {operationError}
              </div>
            ) : null}

            {isImpactLoading ? (
              <PageSkeleton
                cards={4}
                rows={0}
              />
            ) : impact ? (
              <>
                <section
                  className={styles.impactGrid}
                >
                  <article>
                    <span>Movimentações</span>
                    <strong>
                      {impact.transaction_count}
                    </strong>
                  </article>

                  <article>
                    <span>Grupos</span>
                    <strong>
                      {impact.group_count}
                    </strong>
                  </article>

                  <article>
                    <span>Pendentes</span>
                    <strong>
                      {impact.pending_count}
                    </strong>
                  </article>

                  <article>
                    <span>Recorrências ativas</span>
                    <strong>
                      {
                        impact
                          .active_recurring_group_count
                      }
                    </strong>
                  </article>
                </section>

                <p className={styles.periodText}>
                  Período vinculado: {formatDate(
                    impact.first_due_date,
                  )} até {formatDate(
                    impact.last_due_date,
                  )}.
                </p>

                <div
                  className={styles.actionSwitch}
                >
                  <button
                    type="button"
                    className={
                      dataAction === "transfer"
                        ? styles.activeAction
                        : ""
                    }
                    disabled={
                      impact.transaction_count
                      === 0
                      && impact.group_count === 0
                    }
                    onClick={() => {
                      setDataAction("transfer");
                      setOperationError("");
                    }}
                  >
                    Transferir dados
                  </button>

                  <button
                    type="button"
                    className={
                      dataAction === "delete"
                        ? styles.activeDanger
                        : ""
                    }
                    onClick={() => {
                      setDataAction("delete");
                      setOperationError("");
                    }}
                  >
                    Mesclar e excluir
                  </button>
                </div>

                <label
                  className={styles.selectField}
                >
                  <span>
                    {dataAction === "transfer"
                      ? "Conta de destino"
                      : impact.can_delete_without_transfer
                        ? "Conta de destino opcional"
                        : "Conta que receberá os dados"}
                  </span>

                  <select
                    value={targetAccountId}
                    onChange={(event) =>
                      setTargetAccountId(
                        event.target.value,
                      )
                    }
                  >
                    <option value="">
                      Selecione
                    </option>
                    {activeAccounts
                      .filter(
                        (account) =>
                          account.id
                          !== managedAccount.id,
                      )
                      .map((account) => (
                        <option
                          key={account.id}
                          value={account.id}
                        >
                          {account.name}
                        </option>
                      ))}
                  </select>
                </label>

                <aside className={styles.infoBox}>
                  A transferência preserva valores,
                  datas, status e histórico. Apenas a
                  conta vinculada aos grupos e
                  movimentações é alterada.
                </aside>

                {impact.closed_months.length
                > 0 ? (
                  <label
                    className={styles.closedWarning}
                  >
                    <input
                      type="checkbox"
                      checked={confirmClosedMonths}
                      onChange={(event) =>
                        setConfirmClosedMonths(
                          event.target.checked,
                        )
                      }
                    />

                    <span>
                      <strong>
                        Meses fechados afetados
                      </strong>
                      <small>
                        {impact.closed_months
                          .map(formatMonth)
                          .join(", ")}. As
                        fotografias oficiais serão
                        preservadas, mas a situação
                        atual mudará.
                      </small>
                    </span>
                  </label>
                ) : null}

                {dataAction === "delete" ? (
                  <label
                    className={styles.confirmField}
                  >
                    <span>
                      Digite <strong>
                        {managedAccount.name}
                      </strong> para excluir
                    </span>
                    <input
                      value={deleteConfirmation}
                      onChange={(event) =>
                        setDeleteConfirmation(
                          event.target.value,
                        )
                      }
                    />
                  </label>
                ) : null}

                <div
                  className={styles.formActions}
                >
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setManagedAccount(null)
                    }
                  >
                    Cancelar
                  </Button>

                  {dataAction === "delete" ? (
                    <Button
                      variant="danger"
                      isLoading={
                        actionId
                        === managedAccount.id
                      }
                      onClick={() =>
                        void executeDataAction()
                      }
                    >
                      Transferir e excluir
                    </Button>
                  ) : (
                    <Button
                      isLoading={
                        actionId
                        === managedAccount.id
                      }
                      onClick={() =>
                        void executeDataAction()
                      }
                    >
                      Confirmar transferência
                    </Button>
                  )}
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
