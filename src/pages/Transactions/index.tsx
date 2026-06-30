import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useLocation,
  useNavigate,
} from "react-router";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { PageState } from "../../components/PageState";
import { TransactionTable } from "../../components/TransactionTable";
import { accountService } from "../../services/accountService";
import { ApiError } from "../../services/api";
import { transactionService } from "../../services/transactionService";
import type {
  Account,
} from "../../types/finance";
import type {
  GroupType,
  Transaction,
  TransactionStatus,
} from "../../types/transactions";

import styles from "./styles.module.css";


type LocationState = {
  successMessage?: string;
};


function normalizeSearch(
  value: string,
): string {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLocaleLowerCase("pt-BR")
    .trim();
}


export function TransactionsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [
    transactions,
    setTransactions,
  ] = useState<Transaction[]>([]);

  const [accounts, setAccounts] =
    useState<Account[]>([]);

  const [search, setSearch] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
    TransactionStatus | "all"
  >("all");

  const [
    accountFilter,
    setAccountFilter,
  ] = useState("all");

  const [
    groupTypeFilter,
    setGroupTypeFilter,
  ] = useState<GroupType | "all">(
    "all",
  );

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const state =
    location.state as LocationState | null;


  const loadData = useCallback(
    async () => {
      setError("");
      setIsLoading(true);

      try {
        const [
          transactionsData,
          accountsData,
        ] = await Promise.all([
          transactionService.listTransactions({
            limit: 500,
          }),
          accountService.list(),
        ]);

        setTransactions(
          transactionsData,
        );
        setAccounts(accountsData);
      } catch (caughtError) {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "Não foi possível carregar as movimentações.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );


  useEffect(() => {
    void loadData();
  }, [loadData]);


  useEffect(() => {
    if (state?.successMessage) {
      window.history.replaceState(
        {},
        document.title,
        location.pathname,
      );
    }
  }, [
    location.pathname,
    state?.successMessage,
  ]);


  const filteredTransactions =
    useMemo(
      () => {
        const normalizedSearch =
          normalizeSearch(search);

        return transactions.filter(
          (transaction) => {
            const matchesStatus =
              statusFilter === "all"
              || transaction.status
                === statusFilter;

            const matchesAccount =
              accountFilter === "all"
              || transaction.account_id
                === accountFilter;

            const matchesGroupType =
              groupTypeFilter === "all"
              || transaction.group_type
                === groupTypeFilter;

            if (!normalizedSearch) {
              return (
                matchesStatus
                && matchesAccount
                && matchesGroupType
              );
            }

            const searchableText =
              normalizeSearch(
                [
                  transaction.description,
                  transaction.account_name,
                  transaction.category_name
                    ?? "",
                  transaction.group_type,
                  transaction.amount,
                ].join(" "),
              );

            return (
              matchesStatus
              && matchesAccount
              && matchesGroupType
              && searchableText.includes(
                normalizedSearch,
              )
            );
          },
        );
      },
      [
        accountFilter,
        groupTypeFilter,
        search,
        statusFilter,
        transactions,
      ],
    );


  const hasActiveFilters =
    search.trim().length > 0
    || statusFilter !== "all"
    || accountFilter !== "all"
    || groupTypeFilter !== "all";


  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setAccountFilter("all");
    setGroupTypeFilter("all");
  }


  return (
    <div className={styles.page}>
      <header
        className={styles.pageHeader}
      >
        <div>
          <span className={styles.eyebrow}>
            Histórico
          </span>

          <h1>Movimentações</h1>

          <p>
            Encontre, edite e acompanhe
            todas as receitas e despesas.
          </p>
        </div>

        <Button
          onClick={() =>
            navigate(
              "/transactions/new",
            )
          }
        >
          Nova movimentação
        </Button>
      </header>

      {state?.successMessage ? (
        <div
          className={
            styles.successMessage
          }
        >
          {state.successMessage}
        </div>
      ) : null}

      <Card>
        <div className={styles.toolbar}>
          <label
            className={styles.searchField}
          >
            <span>Buscar</span>

            <input
              type="search"
              placeholder="Descrição, conta, categoria ou valor"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
            />
          </label>

          <div
            className={
              styles.selectFilters
            }
          >
            <label>
              <span>Conta</span>

              <select
                value={accountFilter}
                onChange={(event) =>
                  setAccountFilter(
                    event.target.value,
                  )
                }
              >
                <option value="all">
                  Todas
                </option>

                {accounts.map(
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

            <label>
              <span>Tipo</span>

              <select
                value={groupTypeFilter}
                onChange={(event) =>
                  setGroupTypeFilter(
                    event.target.value as GroupType | "all",
                  )
                }
              >
                <option value="all">
                  Todos
                </option>
                <option value="single">
                  Avulsa
                </option>
                <option value="installment">
                  Parcelada
                </option>
                <option value="recurring">
                  Recorrente
                </option>
              </select>
            </label>
          </div>
        </div>

        <div
          className={
            styles.secondaryToolbar
          }
        >
          <div className={styles.filters}>
            {(
              [
                ["all", "Todas"],
                [
                  "pending",
                  "Pendentes",
                ],
                [
                  "completed",
                  "Concluídas",
                ],
                [
                  "cancelled",
                  "Canceladas",
                ],
              ] as const
            ).map(
              ([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={
                    statusFilter
                    === value
                      ? styles.filterActive
                      : ""
                  }
                  onClick={() =>
                    setStatusFilter(
                      value,
                    )
                  }
                >
                  {label}
                </button>
              ),
            )}
          </div>

          <div
            className={
              styles.resultsInfo
            }
          >
            <span>
              {
                filteredTransactions.length
              }{" "}
              movimentações
            </span>

            {hasActiveFilters ? (
              <Button
                type="button"
                variant="tertiary"
                size="small"
                onClick={clearFilters}
              >
                Limpar filtros
              </Button>
            ) : null}
          </div>
        </div>

        {isLoading ? (
          <PageState
            title="Carregando movimentações"
            description="Buscando seu histórico financeiro."
          />
        ) : error ? (
          <PageState
            title="Não foi possível carregar"
            description={error}
            actionLabel="Tentar novamente"
            onAction={() =>
              void loadData()
            }
          />
        ) : (
          filteredTransactions.length
          === 0 ? (
            <PageState
              title="Nenhuma movimentação encontrada"
              description={
                hasActiveFilters
                  ? "Nenhum lançamento corresponde aos filtros selecionados."
                  : "Crie uma movimentação para começar."
              }
              actionLabel={
                hasActiveFilters
                  ? "Limpar filtros"
                  : "Nova movimentação"
              }
              onAction={
                hasActiveFilters
                  ? clearFilters
                  : () =>
                      navigate(
                        "/transactions/new",
                      )
              }
            />
          ) : (
            <TransactionTable
              transactions={
                filteredTransactions
              }
              onChanged={loadData}
            />
          )
        )}
      </Card>
    </div>
  );
}
