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
import { PageState } from "../../components/PageState";
import { ApiError } from "../../services/api";
import { accountService } from "../../services/accountService";
import type {
  Account,
  AccountCreateInput,
  AccountType,
} from "../../types/finance";

import styles from "./styles.module.css";

const accountTypeLabels: Record<AccountType, string> = {
  immediate_payment: "Pagamento imediato",
  credit_card: "Cartão de crédito",
  third_party_credit: "Crédito de terceiro",
  cash: "Dinheiro",
  other: "Outro",
};

const initialForm: AccountCreateInput = {
  name: "",
  type: "immediate_payment",
  is_default: false,
  closing_day: null,
  due_day: null,
};

export function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [form, setForm] = useState<AccountCreateInput>(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);

  const activeAccounts = useMemo(
    () => accounts.filter((account) => account.is_active),
    [accounts],
  );

  const inactiveAccounts = useMemo(
    () => accounts.filter((account) => !account.is_active),
    [accounts],
  );

  const loadAccounts = useCallback(async () => {
    setError("");
    setIsLoading(true);

    try {
      const data = await accountService.list();
      setAccounts(data);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível carregar as contas.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  function openModal() {
    setForm(initialForm);
    setFormError("");
    setIsModalOpen(true);
  }

  function handleTypeChange(type: AccountType) {
    setForm((current) => ({
      ...current,
      type,
      closing_day:
        type === "credit_card" || type === "third_party_credit"
          ? current.closing_day
          : null,
      due_day:
        type === "credit_card" || type === "third_party_credit"
          ? current.due_day
          : null,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const requiresCardDates =
      form.type === "credit_card" ||
      form.type === "third_party_credit";

    if (
      requiresCardDates &&
      (!form.closing_day || !form.due_day)
    ) {
      setFormError(
        "Informe os dias de fechamento e vencimento.",
      );
      return;
    }

    setIsSaving(true);

    try {
      const created = await accountService.create(form);
      setAccounts((current) => {
        const updated = form.is_default
          ? current.map((account) => ({
              ...account,
              is_default: false,
            }))
          : current;

        return [...updated, created].sort((a, b) =>
          a.name.localeCompare(b.name),
        );
      });

      setIsModalOpen(false);
      setForm(initialForm);
    } catch (caughtError) {
      setFormError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível criar a conta.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeactivate(account: Account) {
    const confirmed = window.confirm(
      `Inativar a conta "${account.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    setDeactivatingId(account.id);

    try {
      const updated = await accountService.deactivate(account.id);

      setAccounts((current) =>
        current.map((item) =>
          item.id === updated.id ? updated : item,
        ),
      );
    } catch (caughtError) {
      window.alert(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível inativar a conta.",
      );
    } finally {
      setDeactivatingId(null);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>Organização</span>
          <h1>Contas</h1>
          <p>
            Organize onde suas receitas e despesas acontecem.
          </p>
        </div>

        <Button onClick={openModal}>
          Nova conta
        </Button>
      </header>

      <section className={styles.summaryGrid}>
        <Card>
          <div className={styles.summary}>
            <span>Contas ativas</span>
            <strong>{activeAccounts.length}</strong>
          </div>
        </Card>

        <Card>
          <div className={styles.summary}>
            <span>Conta padrão</span>
            <strong>
              {accounts.find((account) => account.is_default)?.name ??
                "Nenhuma"}
            </strong>
          </div>
        </Card>
      </section>

      <Card>
        {isLoading ? (
          <PageState
            title="Carregando contas"
            description="Buscando suas contas financeiras."
          />
        ) : error ? (
          <PageState
            title="Não foi possível carregar"
            description={error}
            actionLabel="Tentar novamente"
            onAction={() => void loadAccounts()}
          />
        ) : accounts.length === 0 ? (
          <PageState
            title="Nenhuma conta cadastrada"
            description="Crie sua primeira conta para começar a registrar movimentações."
            actionLabel="Criar conta"
            onAction={openModal}
          />
        ) : (
          <div className={styles.accountList}>
            {activeAccounts.map((account) => (
              <article className={styles.accountRow} key={account.id}>
                <div className={styles.accountIdentity}>
                  <div className={styles.accountIcon} aria-hidden="true">
                    {account.type === "credit_card" ? "▣" : "●"}
                  </div>

                  <div>
                    <div className={styles.titleLine}>
                      <strong>{account.name}</strong>

                      {account.is_default ? (
                        <Badge variant="info">Padrão</Badge>
                      ) : null}
                    </div>

                    <span>
                      {accountTypeLabels[account.type]}
                    </span>
                  </div>
                </div>

                <div className={styles.accountMeta}>
                  {account.closing_day ? (
                    <span>Fecha dia {account.closing_day}</span>
                  ) : null}

                  {account.due_day ? (
                    <span>Vence dia {account.due_day}</span>
                  ) : null}
                </div>

                <Button
                  variant="tertiary"
                  size="small"
                  disabled={
                    account.is_default ||
                    deactivatingId === account.id
                  }
                  isLoading={deactivatingId === account.id}
                  onClick={() => void handleDeactivate(account)}
                >
                  Inativar
                </Button>
              </article>
            ))}

            {inactiveAccounts.length > 0 ? (
              <div className={styles.inactiveSection}>
                <h2>Inativas</h2>

                {inactiveAccounts.map((account) => (
                  <article
                    className={[
                      styles.accountRow,
                      styles.inactiveRow,
                    ].join(" ")}
                    key={account.id}
                  >
                    <div className={styles.accountIdentity}>
                      <div className={styles.accountIcon}>○</div>
                      <div>
                        <strong>{account.name}</strong>
                        <span>
                          {accountTypeLabels[account.type]}
                        </span>
                      </div>
                    </div>

                    <Badge>Inativa</Badge>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </Card>

      <Modal
        title="Nova conta"
        description="Cadastre uma forma de pagamento ou recebimento."
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <form className={styles.form} onSubmit={handleSubmit}>
          {formError ? (
            <div className={styles.formError} role="alert">
              {formError}
            </div>
          ) : null}

          <Input
            label="Nome"
            placeholder="Ex.: Nubank, PIX, Crédito Pai"
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            required
          />

          <label className={styles.selectField}>
            <span>Tipo</span>
            <select
              value={form.type}
              onChange={(event) =>
                handleTypeChange(event.target.value as AccountType)
              }
            >
              {Object.entries(accountTypeLabels).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ),
              )}
            </select>
          </label>

          {form.type === "credit_card" ||
          form.type === "third_party_credit" ? (
            <div className={styles.twoColumns}>
              <Input
                label="Dia de fechamento"
                type="number"
                min={1}
                max={31}
                value={form.closing_day ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    closing_day: event.target.value
                      ? Number(event.target.value)
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
                value={form.due_day ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    due_day: event.target.value
                      ? Number(event.target.value)
                      : null,
                  }))
                }
                required
              />
            </div>
          ) : null}

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  is_default: event.target.checked,
                }))
              }
            />
            <span>
              Usar como conta padrão para novos lançamentos
            </span>
          </label>

          <div className={styles.formActions}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>

            <Button type="submit" isLoading={isSaving}>
              Criar conta
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
