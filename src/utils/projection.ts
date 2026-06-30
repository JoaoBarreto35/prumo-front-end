import type {
  PlanningScenario,
  ProjectionMonth,
  ProjectionSummary,
} from "../types/planning";
import type {
  Transaction,
} from "../types/transactions";


function pad(value: number): string {
  return String(value).padStart(2, "0");
}


export function monthKey(value: Date): string {
  return [
    value.getFullYear(),
    pad(value.getMonth() + 1),
  ].join("-");
}


function dateFromMonthKey(key: string): Date {
  const [year, month] = key
    .split("-")
    .map(Number);

  return new Date(year, month - 1, 1, 12, 0, 0);
}


function addMonths(
  value: Date,
  months: number,
): Date {
  return new Date(
    value.getFullYear(),
    value.getMonth() + months,
    1,
    12,
    0,
    0,
  );
}


function monthsBetween(
  start: Date,
  end: Date,
): number {
  return (
    (end.getFullYear() - start.getFullYear()) * 12
    + end.getMonth()
    - start.getMonth()
  );
}


function formatMonthLabel(value: Date): string {
  const label = new Intl.DateTimeFormat(
    "pt-BR",
    {
      month: "short",
      year: "2-digit",
    },
  ).format(value);

  return label.replace(" de ", "/");
}


function scenarioValueInMonth(
  scenario: PlanningScenario,
  month: Date,
): number {
  if (!scenario.is_active) {
    return 0;
  }

  const start = dateFromMonthKey(
    scenario.start_date.slice(0, 7),
  );
  const occurrenceIndex = monthsBetween(
    start,
    month,
  );

  if (occurrenceIndex < 0) {
    return 0;
  }

  const amount = Number(scenario.amount);

  if (scenario.group_type === "single") {
    return occurrenceIndex === 0 ? amount : 0;
  }

  if (scenario.group_type === "installment") {
    const count = scenario.occurrence_count ?? 0;

    if (
      count < 2
      || occurrenceIndex >= count
    ) {
      return 0;
    }

    return amount / count;
  }

  if (
    scenario.occurrence_count !== null
    && occurrenceIndex >= scenario.occurrence_count
  ) {
    return 0;
  }

  return amount;
}


export function buildProjection(
  transactions: Transaction[],
  scenarios: PlanningScenario[],
  horizon: number,
  initialBalance: number,
  startDate = new Date(),
): ProjectionMonth[] {
  const projectionStart = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    1,
    12,
    0,
    0,
  );

  let accumulatedBalance = initialBalance;

  return Array.from(
    { length: horizon },
    (_, index) => {
      const month = addMonths(
        projectionStart,
        index,
      );
      const key = monthKey(month);

      const monthTransactions = transactions.filter(
        (transaction) => (
          transaction.status !== "cancelled"
          && transaction.due_date.slice(0, 7) === key
        ),
      );

      const baseIncome = monthTransactions
        .filter(
          (transaction) => (
            transaction.transaction_type === "income"
          ),
        )
        .reduce(
          (total, transaction) => (
            total + Number(transaction.amount)
          ),
          0,
        );

      const baseExpense = monthTransactions
        .filter(
          (transaction) => (
            transaction.transaction_type === "expense"
          ),
        )
        .reduce(
          (total, transaction) => (
            total + Number(transaction.amount)
          ),
          0,
        );

      const scenarioIncome = scenarios
        .filter(
          (scenario) => (
            scenario.transaction_type === "income"
          ),
        )
        .reduce(
          (total, scenario) => (
            total
            + scenarioValueInMonth(
              scenario,
              month,
            )
          ),
          0,
        );

      const scenarioExpense = scenarios
        .filter(
          (scenario) => (
            scenario.transaction_type === "expense"
          ),
        )
        .reduce(
          (total, scenario) => (
            total
            + scenarioValueInMonth(
              scenario,
              month,
            )
          ),
          0,
        );

      const baseResult = baseIncome - baseExpense;
      const projectedResult = (
        baseResult
        + scenarioIncome
        - scenarioExpense
      );

      accumulatedBalance += projectedResult;

      return {
        key,
        label: formatMonthLabel(month),
        baseIncome,
        baseExpense,
        scenarioIncome,
        scenarioExpense,
        baseResult,
        projectedResult,
        accumulatedBalance,
      };
    },
  );
}


export function summarizeProjection(
  months: ProjectionMonth[],
  activeScenarioCount: number,
): ProjectionSummary {
  const finalBalance = (
    months.at(-1)?.accumulatedBalance
    ?? 0
  );
  const minimumBalance = Math.min(
    ...months.map(
      (month) => month.accumulatedBalance,
    ),
    finalBalance,
  );
  const firstNegativeMonth = (
    months.find(
      (month) => month.accumulatedBalance < 0,
    )
    ?? null
  );
  const averageExpense = (
    months.length > 0
      ? months.reduce(
          (total, month) => (
            total
            + month.baseExpense
            + month.scenarioExpense
          ),
          0,
        ) / months.length
      : 0
  );

  let verdict: ProjectionSummary["verdict"];

  if (firstNegativeMonth) {
    verdict = "risk";
  } else if (
    minimumBalance
    < averageExpense * 0.5
  ) {
    verdict = "attention";
  } else {
    verdict = "comfortable";
  }

  return {
    finalBalance,
    minimumBalance,
    firstNegativeMonth,
    averageExpense,
    activeScenarioCount,
    verdict,
  };
}
