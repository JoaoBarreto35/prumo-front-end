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
import type { Account } from "../../types/finance";
import type {
  GroupType,
  Transaction,
  TransactionStatus,
} from "../../types/transactions";
import { formatCurrency } from "../../utils/currency";
import { PageSkeleton } from "../../components/PageSkeleton";

import styles from "./styles.module.css";


type CalendarView = "calendar" | "agenda";


type CalendarLocationState = {
  selectedDate?: string;
  successMessage?: string;
};


type CalendarDay = {
  date: Date;
  dateKey: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  transactions: Transaction[];
  income: number;
  expense: number;
  pending: number;
  overdue: number;
};


type AgendaDay = {
  dateKey: string;
  transactions: Transaction[];
  income: number;
  expense: number;
  pending: number;
  overdue: number;
};


const weekDays = [
  "Dom",
  "Seg",
  "Ter",
  "Qua",
  "Qui",
  "Sex",
  "Sáb",
];


function pad(value: number): string {
  return String(value).padStart(2, "0");
}


function toDateKey(value: Date): string {
  return [
    value.getFullYear(),
    pad(value.getMonth() + 1),
    pad(value.getDate()),
  ].join("-");
}


function isDateKey(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  );
}


function fromDateKey(value: string): Date {
  const [year, month, day] = value
    .split("-")
    .map(Number);

  return new Date(year, month - 1, day, 12, 0, 0);
}


function startOfMonth(value: Date): Date {
  return new Date(
    value.getFullYear(),
    value.getMonth(),
    1,
    12,
    0,
    0,
  );
}


function endOfMonth(value: Date): Date {
  return new Date(
    value.getFullYear(),
    value.getMonth() + 1,
    0,
    12,
    0,
    0,
  );
}


function formatMonth(value: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(value);
}


function formatLongDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(fromDateKey(value));
}


function isOverdue(transaction: Transaction): boolean {
  return (
    transaction.status === "pending" &&
    transaction.due_date < toDateKey(new Date())
  );
}


function summarizeDay(
  date: Date,
  referenceDate: Date,
  transactions: Transaction[],
): CalendarDay {
  const activeTransactions = transactions.filter(
    (transaction) => transaction.status !== "cancelled",
  );

  const income = activeTransactions
    .filter(
      (transaction) =>
        transaction.transaction_type === "income",
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0,
    );

  const expense = activeTransactions
    .filter(
      (transaction) =>
        transaction.transaction_type === "expense",
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0,
    );

  return {
    date,
    dateKey: toDateKey(date),
    isCurrentMonth:
      date.getMonth() === referenceDate.getMonth() &&
      date.getFullYear() === referenceDate.getFullYear(),
    isToday: toDateKey(date) === toDateKey(new Date()),
    transactions,
    income,
    expense,
    pending: transactions.filter(
      (transaction) => transaction.status === "pending",
    ).length,
    overdue: transactions.filter(isOverdue).length,
  };
}


function buildCalendarDays(
  referenceDate: Date,
  transactions: Transaction[],
): CalendarDay[] {
  const firstDay = startOfMonth(referenceDate);
  const gridStart = new Date(firstDay);

  gridStart.setDate(
    firstDay.getDate() - firstDay.getDay(),
  );

  const transactionsByDate = new Map<
    string,
    Transaction[]
  >();

  transactions.forEach((transaction) => {
    const current =
      transactionsByDate.get(transaction.due_date) ?? [];

    current.push(transaction);
    transactionsByDate.set(
      transaction.due_date,
      current,
    );
  });

  return Array.from(
    { length: 42 },
    (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);

      const dateKey = toDateKey(date);

      return summarizeDay(
        date,
        referenceDate,
        transactionsByDate.get(dateKey) ?? [],
      );
    },
  );
}


function buildAgendaDays(
  transactions: Transaction[],
): AgendaDay[] {
  const grouped = new Map<string, Transaction[]>();

  transactions.forEach((transaction) => {
    const current = grouped.get(transaction.due_date) ?? [];

    current.push(transaction);
    grouped.set(transaction.due_date, current);
  });

  return [...grouped.entries()]
    .sort(([firstDate], [secondDate]) =>
      firstDate.localeCompare(secondDate),
    )
    .map(([dateKey, dayTransactions]) => {
      const summary = summarizeDay(
        fromDateKey(dateKey),
        fromDateKey(dateKey),
        dayTransactions,
      );

      return {
        dateKey,
        transactions: dayTransactions,
        income: summary.income,
        expense: summary.expense,
        pending: summary.pending,
        overdue: summary.overdue,
      };
    });
}


export function CalendarPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState =
    location.state as CalendarLocationState | null;

  const initialSelectedDate = isDateKey(
    locationState?.selectedDate,
  )
    ? locationState.selectedDate
    : toDateKey(new Date());

  const [referenceDate, setReferenceDate] = useState(
    () => startOfMonth(fromDateKey(initialSelectedDate)),
  );
  const [selectedDate, setSelectedDate] = useState(
    initialSelectedDate,
  );
  const [view, setView] = useState<CalendarView>(
    "calendar",
  );
  const [transactions, setTransactions] = useState<
    Transaction[]
  >([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountFilter, setAccountFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<
    TransactionStatus | "all"
  >("all");
  const [groupTypeFilter, setGroupTypeFilter] = useState<
    GroupType | "all"
  >("all");
  const [successMessage, setSuccessMessage] = useState(
    locationState?.successMessage ?? "",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");


  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const [transactionsData, accountsData] =
        await Promise.all([
          transactionService.listTransactions({
            limit: 500,
          }),
          accountService.list(),
        ]);

      setTransactions(transactionsData);
      setAccounts(accountsData);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível carregar o calendário.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    void loadData();
  }, [loadData]);


  useEffect(() => {
    if (
      locationState?.selectedDate ||
      locationState?.successMessage
    ) {
      window.history.replaceState(
        {},
        document.title,
        location.pathname,
      );
    }
  }, [
    location.pathname,
    locationState?.selectedDate,
    locationState?.successMessage,
  ]);


  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeoutId = window.setTimeout(
      () => setSuccessMessage(""),
      4500,
    );

    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);


  const filteredTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        const matchesAccount =
          accountFilter === "all" ||
          transaction.account_id === accountFilter;

        const matchesStatus =
          statusFilter === "all" ||
          transaction.status === statusFilter;

        const matchesGroupType =
          groupTypeFilter === "all" ||
          transaction.group_type === groupTypeFilter;

        return (
          matchesAccount &&
          matchesStatus &&
          matchesGroupType
        );
      }),
    [
      accountFilter,
      groupTypeFilter,
      statusFilter,
      transactions,
    ],
  );


  const monthStartKey = toDateKey(
    startOfMonth(referenceDate),
  );
  const monthEndKey = toDateKey(
    endOfMonth(referenceDate),
  );


  const monthTransactions = useMemo(
    () =>
      filteredTransactions.filter(
        (transaction) =>
          transaction.due_date >= monthStartKey &&
          transaction.due_date <= monthEndKey,
      ),
    [
      filteredTransactions,
      monthEndKey,
      monthStartKey,
    ],
  );


  const selectedTransactions = useMemo(
    () =>
      filteredTransactions
        .filter(
          (transaction) =>
            transaction.due_date === selectedDate,
        )
        .sort((first, second) =>
          first.description.localeCompare(
            second.description,
            "pt-BR",
          ),
        ),
    [filteredTransactions, selectedDate],
  );


  const calendarDays = useMemo(
    () =>
      buildCalendarDays(
        referenceDate,
        filteredTransactions,
      ),
    [filteredTransactions, referenceDate],
  );


  const agendaDays = useMemo(
    () => buildAgendaDays(monthTransactions),
    [monthTransactions],
  );


  const activeMonthTransactions = useMemo(
    () =>
      monthTransactions.filter(
        (transaction) =>
          transaction.status !== "cancelled",
      ),
    [monthTransactions],
  );


  const monthIncome = useMemo(
    () =>
      activeMonthTransactions
        .filter(
          (transaction) =>
            transaction.transaction_type === "income",
        )
        .reduce(
          (total, transaction) =>
            total + Number(transaction.amount),
          0,
        ),
    [activeMonthTransactions],
  );


  const monthExpense = useMemo(
    () =>
      activeMonthTransactions
        .filter(
          (transaction) =>
            transaction.transaction_type === "expense",
        )
        .reduce(
          (total, transaction) =>
            total + Number(transaction.amount),
          0,
        ),
    [activeMonthTransactions],
  );


  const monthPending = useMemo(
    () =>
      monthTransactions.filter(
        (transaction) =>
          transaction.status === "pending",
      ).length,
    [monthTransactions],
  );


  const monthOverdue = useMemo(
    () => monthTransactions.filter(isOverdue).length,
    [monthTransactions],
  );


  function changeMonth(offset: number) {
    const nextMonth = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth() + offset,
      1,
      12,
      0,
      0,
    );

    setReferenceDate(nextMonth);
    setSelectedDate(toDateKey(nextMonth));
  }


  function goToToday() {
    const today = new Date();

    setReferenceDate(startOfMonth(today));
    setSelectedDate(toDateKey(today));
  }


  function selectDate(dateKey: string) {
    const date = fromDateKey(dateKey);

    setSelectedDate(dateKey);

    if (
      date.getMonth() !== referenceDate.getMonth() ||
      date.getFullYear() !== referenceDate.getFullYear()
    ) {
      setReferenceDate(startOfMonth(date));
    }
  }


  function createTransactionForSelectedDate() {
    navigate("/transactions/new", {
      state: {
        initialDate: selectedDate,
        returnTo: "/calendar",
      },
    });
  }


  if (isLoading) {
    return (
      <PageSkeleton
      cards={4}
      rows={6}
    />
    );
  }


  if (error) {
    return (
      <Card>
        <PageState
          title="Não foi possível carregar o calendário"
          description={error}
          actionLabel="Tentar novamente"
          onAction={() => void loadData()}
        />
      </Card>
    );
  }


  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>
            Planejamento mensal
          </span>
          <h1>Calendário financeiro</h1>
          <p>
            Enxergue vencimentos, parcelas e receitas no dia certo.
          </p>
        </div>

        <Button onClick={createTransactionForSelectedDate}>
          Nova movimentação em {fromDateKey(selectedDate).getDate()}
        </Button>
      </header>

      {successMessage ? (
        <div className={styles.successMessage}>
          {successMessage}
        </div>
      ) : null}

      <section className={styles.controls}>
        <div className={styles.monthNavigation}>
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label="Mês anterior"
          >
            ‹
          </button>

          <strong>{formatMonth(referenceDate)}</strong>

          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label="Próximo mês"
          >
            ›
          </button>

          <Button
            type="button"
            variant="tertiary"
            size="small"
            onClick={goToToday}
          >
            Hoje
          </Button>
        </div>

        <div className={styles.viewSwitch}>
          <button
            type="button"
            className={
              view === "calendar"
                ? styles.viewActive
                : ""
            }
            onClick={() => setView("calendar")}
          >
            Calendário
          </button>

          <button
            type="button"
            className={
              view === "agenda"
                ? styles.viewActive
                : ""
            }
            onClick={() => setView("agenda")}
          >
            Agenda
          </button>
        </div>
      </section>

      <section className={styles.filters}>
        <label>
          <span>Conta</span>
          <select
            value={accountFilter}
            onChange={(event) =>
              setAccountFilter(event.target.value)
            }
          >
            <option value="all">Todas as contas</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Status</span>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | TransactionStatus
                  | "all",
              )
            }
          >
            <option value="all">Todos</option>
            <option value="pending">Pendentes</option>
            <option value="completed">Concluídas</option>
            <option value="cancelled">Canceladas</option>
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
            <option value="all">Todos</option>
            <option value="single">Avulsas</option>
            <option value="installment">Parceladas</option>
            <option value="recurring">Recorrentes</option>
          </select>
        </label>
      </section>

      <section className={styles.metricsGrid}>
        <Card>
          <div className={styles.metric}>
            <span>Receitas do mês</span>
            <strong className={styles.income}>
              {formatCurrency(monthIncome)}
            </strong>
          </div>
        </Card>

        <Card>
          <div className={styles.metric}>
            <span>Despesas do mês</span>
            <strong className={styles.expense}>
              {formatCurrency(monthExpense)}
            </strong>
          </div>
        </Card>

        <Card>
          <div className={styles.metric}>
            <span>Resultado previsto</span>
            <strong
              className={
                monthIncome - monthExpense >= 0
                  ? styles.income
                  : styles.expense
              }
            >
              {formatCurrency(
                monthIncome - monthExpense,
              )}
            </strong>
          </div>
        </Card>

        <Card>
          <div className={styles.metric}>
            <span>Pendências</span>
            <strong>{monthPending}</strong>
            <small>{monthOverdue} atrasadas</small>
          </div>
        </Card>
      </section>

      {view === "calendar" ? (
        <Card>
          <div className={styles.calendarScroll}>
            <div className={styles.weekHeader}>
              {weekDays.map((weekDay) => (
                <span key={weekDay}>{weekDay}</span>
              ))}
            </div>

            <div className={styles.calendarGrid}>
              {calendarDays.map((day) => (
                <button
                  type="button"
                  key={day.dateKey}
                  className={[
                    styles.dayCell,
                    !day.isCurrentMonth
                      ? styles.outsideMonth
                      : "",
                    day.isToday ? styles.today : "",
                    selectedDate === day.dateKey
                      ? styles.selectedDay
                      : "",
                    day.overdue > 0
                      ? styles.overdueDay
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => selectDate(day.dateKey)}
                >
                  <div className={styles.dayHeader}>
                    <span>{day.date.getDate()}</span>
                    {day.transactions.length > 0 ? (
                      <small>
                        {day.transactions.length}
                      </small>
                    ) : null}
                  </div>

                  {day.transactions.length > 0 ? (
                    <div className={styles.daySummary}>
                      {day.expense > 0 ? (
                        <span className={styles.expense}>
                          − {formatCurrency(day.expense)}
                        </span>
                      ) : null}

                      {day.income > 0 ? (
                        <span className={styles.income}>
                          + {formatCurrency(day.income)}
                        </span>
                      ) : null}

                      {day.pending > 0 ? (
                        <small>
                          {day.pending} pendente
                          {day.pending > 1 ? "s" : ""}
                        </small>
                      ) : null}

                      {day.overdue > 0 ? (
                        <small className={styles.overdueText}>
                          {day.overdue} atrasada
                          {day.overdue > 1 ? "s" : ""}
                        </small>
                      ) : null}
                    </div>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </Card>
      ) : (
        <Card
          title="Agenda do mês"
          description="Selecione uma data para abrir seus lançamentos."
        >
          {agendaDays.length === 0 ? (
            <PageState
              title="Nenhum compromisso neste mês"
              description="As movimentações do período aparecerão aqui."
            />
          ) : (
            <div className={styles.agendaList}>
              {agendaDays.map((day) => (
                <button
                  type="button"
                  key={day.dateKey}
                  className={[
                    styles.agendaItem,
                    selectedDate === day.dateKey
                      ? styles.agendaItemActive
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => selectDate(day.dateKey)}
                >
                  <div>
                    <strong>
                      {formatLongDate(day.dateKey)}
                    </strong>
                    <span>
                      {day.transactions.length} movimentação
                      {day.transactions.length > 1 ? "ões" : ""}
                    </span>
                  </div>

                  <div className={styles.agendaValues}>
                    {day.income > 0 ? (
                      <strong className={styles.income}>
                        + {formatCurrency(day.income)}
                      </strong>
                    ) : null}
                    {day.expense > 0 ? (
                      <strong className={styles.expense}>
                        − {formatCurrency(day.expense)}
                      </strong>
                    ) : null}
                    {day.overdue > 0 ? (
                      <span className={styles.overdueBadge}>
                        {day.overdue} atrasada
                        {day.overdue > 1 ? "s" : ""}
                      </span>
                    ) : day.pending > 0 ? (
                      <span>
                        {day.pending} pendente
                        {day.pending > 1 ? "s" : ""}
                      </span>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      <Card>
        <div className={styles.selectedHeader}>
          <div>
            <span className={styles.eyebrow}>
              Dia selecionado
            </span>
            <h2>{formatLongDate(selectedDate)}</h2>
            <p>
              {selectedTransactions.length} movimentação
              {selectedTransactions.length !== 1 ? "ões" : ""}
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={createTransactionForSelectedDate}
          >
            Adicionar neste dia
          </Button>
        </div>

        {selectedTransactions.length === 0 ? (
          <PageState
            title="Dia livre"
            description="Não há movimentações nesta data."
            actionLabel="Adicionar movimentação"
            onAction={createTransactionForSelectedDate}
          />
        ) : (
          <TransactionTable
            transactions={selectedTransactions}
            onChanged={loadData}
          />
        )}
      </Card>
    </div>
  );
}
