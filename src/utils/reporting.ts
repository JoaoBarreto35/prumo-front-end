import type {
  GroupType,
  Transaction,
  TransactionStatus,
  TransactionType,
} from "../types/transactions";


export type ReportPeriodPreset =
  | "current_month"
  | "previous_month"
  | "last_3_months"
  | "last_6_months"
  | "last_12_months"
  | "custom";


export type ReportFilters = {
  accountId: string;
  categoryId: string;
  transactionType: TransactionType | "all";
  status: TransactionStatus | "active";
  groupType: GroupType | "all";
  search: string;
};


export type DateRange = {
  start: string;
  end: string;
};


export type ReportSummary = {
  income: number;
  expense: number;
  balance: number;
  savingsRate: number | null;
  averageMonthlyIncome: number;
  averageMonthlyExpense: number;
  transactionCount: number;
  pendingCount: number;
  completedCount: number;
  cancelledCount: number;
};


export type MonthlyReportPoint = {
  key: string;
  label: string;
  income: number;
  expense: number;
  balance: number;
};


export type NamedAmount = {
  id: string;
  label: string;
  value: number;
  count: number;
  percentage: number;
};


export type ComparisonResult = {
  value: number;
  previousValue: number;
  percentageChange: number | null;
};


const monthFormatter = new Intl.DateTimeFormat(
  "pt-BR",
  {
    month: "short",
    year: "2-digit",
  },
);


function parseDate(
  value: string,
): Date {
  return new Date(`${value}T12:00:00`);
}


function formatDateKey(
  value: Date,
): string {
  const year = value.getFullYear();
  const month = String(
    value.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(
    value.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function startOfMonth(
  value: Date,
): Date {
  return new Date(
    value.getFullYear(),
    value.getMonth(),
    1,
    12,
  );
}


function endOfMonth(
  value: Date,
): Date {
  return new Date(
    value.getFullYear(),
    value.getMonth() + 1,
    0,
    12,
  );
}


function addMonths(
  value: Date,
  amount: number,
): Date {
  return new Date(
    value.getFullYear(),
    value.getMonth() + amount,
    value.getDate(),
    12,
  );
}


function addDays(
  value: Date,
  amount: number,
): Date {
  const result = new Date(value);
  result.setDate(result.getDate() + amount);
  return result;
}


function differenceInDays(
  start: Date,
  end: Date,
): number {
  const millisecondsPerDay =
    24 * 60 * 60 * 1000;

  return Math.floor(
    (
      end.getTime()
      - start.getTime()
    )
    / millisecondsPerDay,
  );
}


function normalizeText(
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


function isWithinRange(
  value: string,
  range: DateRange,
): boolean {
  return (
    value >= range.start
    && value <= range.end
  );
}


function countMonths(
  range: DateRange,
): number {
  const start = parseDate(range.start);
  const end = parseDate(range.end);

  return Math.max(
    1,
    (
      end.getFullYear()
      - start.getFullYear()
    ) * 12
    + end.getMonth()
    - start.getMonth()
    + 1,
  );
}


export function getReportRange(
  preset: ReportPeriodPreset,
  customStart: string,
  customEnd: string,
  today = new Date(),
): DateRange {
  const currentMonthStart =
    startOfMonth(today);
  const currentMonthEnd =
    endOfMonth(today);

  if (
    preset === "previous_month"
  ) {
    const previousMonth =
      addMonths(
        currentMonthStart,
        -1,
      );

    return {
      start: formatDateKey(
        startOfMonth(previousMonth),
      ),
      end: formatDateKey(
        endOfMonth(previousMonth),
      ),
    };
  }

  if (
    preset === "last_3_months"
  ) {
    return {
      start: formatDateKey(
        startOfMonth(
          addMonths(
            currentMonthStart,
            -2,
          ),
        ),
      ),
      end: formatDateKey(
        currentMonthEnd,
      ),
    };
  }

  if (
    preset === "last_6_months"
  ) {
    return {
      start: formatDateKey(
        startOfMonth(
          addMonths(
            currentMonthStart,
            -5,
          ),
        ),
      ),
      end: formatDateKey(
        currentMonthEnd,
      ),
    };
  }

  if (
    preset === "last_12_months"
  ) {
    return {
      start: formatDateKey(
        startOfMonth(
          addMonths(
            currentMonthStart,
            -11,
          ),
        ),
      ),
      end: formatDateKey(
        currentMonthEnd,
      ),
    };
  }

  if (
    preset === "custom"
    && customStart
    && customEnd
  ) {
    return {
      start:
        customStart <= customEnd
          ? customStart
          : customEnd,
      end:
        customStart <= customEnd
          ? customEnd
          : customStart,
    };
  }

  return {
    start: formatDateKey(
      currentMonthStart,
    ),
    end: formatDateKey(
      currentMonthEnd,
    ),
  };
}


export function getPreviousRange(
  range: DateRange,
): DateRange {
  const start = parseDate(range.start);
  const end = parseDate(range.end);

  const duration =
    differenceInDays(
      start,
      end,
    ) + 1;

  const previousEnd =
    addDays(start, -1);
  const previousStart =
    addDays(
      previousEnd,
      -(duration - 1),
    );

  return {
    start: formatDateKey(
      previousStart,
    ),
    end: formatDateKey(
      previousEnd,
    ),
  };
}


export function filterReportTransactions(
  transactions: Transaction[],
  range: DateRange,
  filters: ReportFilters,
): Transaction[] {
  const normalizedSearch =
    normalizeText(filters.search);

  return transactions.filter(
    (transaction) => {
      if (
        !isWithinRange(
          transaction.due_date,
          range,
        )
      ) {
        return false;
      }

      if (
        filters.accountId !== "all"
        && transaction.account_id
          !== filters.accountId
      ) {
        return false;
      }

      if (
        filters.categoryId !== "all"
        && (
          transaction.category_id
            ?? "uncategorized"
        ) !== filters.categoryId
      ) {
        return false;
      }

      if (
        filters.transactionType
          !== "all"
        && transaction.transaction_type
          !== filters.transactionType
      ) {
        return false;
      }

      if (
        filters.groupType !== "all"
        && transaction.group_type
          !== filters.groupType
      ) {
        return false;
      }

      if (
        filters.status === "active"
        && transaction.status
          === "cancelled"
      ) {
        return false;
      }

      if (
        filters.status !== "active"
        && transaction.status
          !== filters.status
      ) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableText =
        normalizeText(
          [
            transaction.description,
            transaction.account_name,
            transaction.category_name
              ?? "sem categoria",
            transaction.group_type,
            transaction.transaction_type,
            transaction.status,
            transaction.amount,
          ].join(" "),
        );

      return searchableText.includes(
        normalizedSearch,
      );
    },
  );
}


export function buildSummary(
  transactions: Transaction[],
  range: DateRange,
): ReportSummary {
  let income = 0;
  let expense = 0;
  let pendingCount = 0;
  let completedCount = 0;
  let cancelledCount = 0;

  transactions.forEach(
    (transaction) => {
      if (
        transaction.status
        === "pending"
      ) {
        pendingCount += 1;
      } else if (
        transaction.status
        === "completed"
      ) {
        completedCount += 1;
      } else {
        cancelledCount += 1;
      }

      if (
        transaction.status
        === "cancelled"
      ) {
        return;
      }

      if (
        transaction.transaction_type
        === "income"
      ) {
        income += Number(
          transaction.amount,
        );
      } else {
        expense += Number(
          transaction.amount,
        );
      }
    },
  );

  const months =
    countMonths(range);

  return {
    income,
    expense,
    balance:
      income - expense,
    savingsRate:
      income > 0
        ? (
            (
              income - expense
            )
            / income
          ) * 100
        : null,
    averageMonthlyIncome:
      income / months,
    averageMonthlyExpense:
      expense / months,
    transactionCount:
      transactions.length,
    pendingCount,
    completedCount,
    cancelledCount,
  };
}


export function buildComparison(
  value: number,
  previousValue: number,
): ComparisonResult {
  if (previousValue === 0) {
    return {
      value,
      previousValue,
      percentageChange:
        value === 0
          ? 0
          : null,
    };
  }

  return {
    value,
    previousValue,
    percentageChange:
      (
        (
          value
          - previousValue
        )
        / Math.abs(previousValue)
      ) * 100,
  };
}


export function buildMonthlySeries(
  transactions: Transaction[],
  range: DateRange,
): MonthlyReportPoint[] {
  const start =
    startOfMonth(
      parseDate(range.start),
    );
  const end =
    startOfMonth(
      parseDate(range.end),
    );

  const points:
    MonthlyReportPoint[] = [];

  let cursor = start;

  while (cursor <= end) {
    const monthKey =
      `${cursor.getFullYear()}-${String(
        cursor.getMonth() + 1,
      ).padStart(2, "0")}`;

    points.push({
      key: monthKey,
      label: monthFormatter
        .format(cursor)
        .replace(".", ""),
      income: 0,
      expense: 0,
      balance: 0,
    });

    cursor = addMonths(
      cursor,
      1,
    );
  }

  const byKey = new Map(
    points.map(
      (point) => [
        point.key,
        point,
      ],
    ),
  );

  transactions.forEach(
    (transaction) => {
      if (
        transaction.status
        === "cancelled"
      ) {
        return;
      }

      const key =
        transaction.due_date.slice(
          0,
          7,
        );
      const point = byKey.get(key);

      if (!point) {
        return;
      }

      const amount =
        Number(transaction.amount);

      if (
        transaction.transaction_type
        === "income"
      ) {
        point.income += amount;
      } else {
        point.expense += amount;
      }

      point.balance =
        point.income
        - point.expense;
    },
  );

  return points;
}


function buildNamedAmounts(
  transactions: Transaction[],
  getId: (
    transaction: Transaction,
  ) => string,
  getLabel: (
    transaction: Transaction,
  ) => string,
): NamedAmount[] {
  const totals = new Map<
    string,
    {
      label: string;
      value: number;
      count: number;
    }
  >();

  transactions.forEach(
    (transaction) => {
      if (
        transaction.status
          === "cancelled"
        || transaction.transaction_type
          !== "expense"
      ) {
        return;
      }

      const id =
        getId(transaction);
      const current =
        totals.get(id);

      totals.set(
        id,
        {
          label:
            current?.label
            ?? getLabel(transaction),
          value:
            (
              current?.value
              ?? 0
            )
            + Number(
              transaction.amount,
            ),
          count:
            (
              current?.count
              ?? 0
            ) + 1,
        },
      );
    },
  );

  const totalValue =
    [...totals.values()]
      .reduce(
        (
          total,
          item,
        ) => total + item.value,
        0,
      );

  return [...totals.entries()]
    .map(
      ([
        id,
        item,
      ]) => ({
        id,
        label: item.label,
        value: item.value,
        count: item.count,
        percentage:
          totalValue > 0
            ? (
                item.value
                / totalValue
              ) * 100
            : 0,
      }),
    )
    .sort(
      (a, b) =>
        b.value - a.value,
    );
}


export function buildCategoryTotals(
  transactions: Transaction[],
): NamedAmount[] {
  return buildNamedAmounts(
    transactions,
    (transaction) =>
      transaction.category_id
      ?? "uncategorized",
    (transaction) =>
      transaction.category_name
      ?? "Sem categoria",
  );
}


export function buildAccountTotals(
  transactions: Transaction[],
): NamedAmount[] {
  return buildNamedAmounts(
    transactions,
    (transaction) =>
      transaction.account_id,
    (transaction) =>
      transaction.account_name,
  );
}


export function buildGroupTypeTotals(
  transactions: Transaction[],
): NamedAmount[] {
  const labels:
    Record<GroupType, string> = {
      single: "Avulsas",
      installment: "Parceladas",
      recurring: "Recorrentes",
    };

  return buildNamedAmounts(
    transactions,
    (transaction) =>
      transaction.group_type,
    (transaction) =>
      labels[
        transaction.group_type
      ],
  );
}


export function getTopExpenses(
  transactions: Transaction[],
  limit = 10,
): Transaction[] {
  return transactions
    .filter(
      (transaction) =>
        transaction.status
          !== "cancelled"
        && transaction.transaction_type
          === "expense",
    )
    .sort(
      (a, b) =>
        Number(b.amount)
        - Number(a.amount),
    )
    .slice(0, limit);
}


function escapeCsvValue(
  value: string,
): string {
  const escaped =
    value.replace(/"/g, '""');

  return `"${escaped}"`;
}


export function createReportCsv(
  transactions: Transaction[],
): string {
  const header = [
    "Descrição",
    "Tipo",
    "Formato",
    "Conta",
    "Categoria",
    "Parcela/Ocorrência",
    "Data prevista",
    "Status",
    "Valor",
  ];

  const groupLabels:
    Record<GroupType, string> = {
      single: "Avulsa",
      installment: "Parcelada",
      recurring: "Recorrente",
    };

  const rows =
    transactions.map(
      (transaction) => [
        transaction.description,
        transaction.transaction_type
          === "income"
          ? "Receita"
          : "Despesa",
        groupLabels[
          transaction.group_type
        ],
        transaction.account_name,
        transaction.category_name
          ?? "Sem categoria",
        transaction.group_type
          === "single"
          ? "-"
          : (
              `${transaction.sequence_number}`
              + ` de ${transaction.total_occurrences}`
            ),
        transaction.due_date,
        transaction.status,
        Number(
          transaction.amount,
        ).toFixed(2),
      ],
    );

  return [
    "\ufeff",
    [
      header,
      ...rows,
    ]
      .map(
        (row) =>
          row
            .map(
              (value) =>
                escapeCsvValue(
                  String(value),
                ),
            )
            .join(";"),
      )
      .join("\n"),
  ].join("");
}
