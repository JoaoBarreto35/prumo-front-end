import type {
  MonthlyReportPoint,
  NamedAmount,
} from "../../utils/reporting";
import {
  formatCurrency,
} from "../../utils/currency";

import styles from "./styles.module.css";


type MonthlyChartProps = {
  data: MonthlyReportPoint[];
};


type NamedAmountChartProps = {
  data: NamedAmount[];
  emptyMessage: string;
};


const donutColors = [
  "#d98b00",
  "#3d7eff",
  "#23a36d",
  "#8a5cf5",
  "#db5d69",
  "#4c9eaa",
  "#b67939",
  "#6f7785",
];


export function MonthlyComparisonChart({
  data,
}: MonthlyChartProps) {
  const maximum = Math.max(
    ...data.flatMap(
      (point) => [
        point.income,
        point.expense,
      ],
    ),
    1,
  );

  return (
    <div className={styles.monthlyChart}>
      <div className={styles.chartLegend}>
        <span>
          <i className={styles.incomeLegend} />
          Receitas
        </span>

        <span>
          <i className={styles.expenseLegend} />
          Despesas
        </span>
      </div>

      <div className={styles.monthlyPlot}>
        {data.map((point) => (
          <div
            className={styles.monthColumn}
            key={point.key}
          >
            <div className={styles.barsArea}>
              <div
                className={[
                  styles.bar,
                  styles.incomeBar,
                ].join(" ")}
                style={{
                  height:
                    `${Math.max(
                      2,
                      (
                        point.income
                        / maximum
                      ) * 100,
                    )}%`,
                }}
                title={
                  `Receitas: ${formatCurrency(
                    point.income,
                  )}`
                }
              />

              <div
                className={[
                  styles.bar,
                  styles.expenseBar,
                ].join(" ")}
                style={{
                  height:
                    `${Math.max(
                      2,
                      (
                        point.expense
                        / maximum
                      ) * 100,
                    )}%`,
                }}
                title={
                  `Despesas: ${formatCurrency(
                    point.expense,
                  )}`
                }
              />
            </div>

            <span>{point.label}</span>

            <strong
              className={
                point.balance >= 0
                  ? styles.positive
                  : styles.negative
              }
            >
              {formatCurrency(
                point.balance,
              )}
            </strong>
          </div>
        ))}
      </div>

      <div className={styles.mobileMonthlyList}>
        {data.map((point) => (
          <article key={point.key}>
            <header>
              <strong>{point.label}</strong>

              <span
                className={
                  point.balance >= 0
                    ? styles.positive
                    : styles.negative
                }
              >
                Saldo{" "}
                {formatCurrency(
                  point.balance,
                )}
              </span>
            </header>

            <div className={styles.mobileValueRow}>
              <span>Receitas</span>
              <strong className={styles.positive}>
                {formatCurrency(
                  point.income,
                )}
              </strong>
            </div>

            <div className={styles.mobileTrack}>
              <div
                className={styles.mobileIncomeValue}
                style={{
                  width:
                    `${Math.max(
                      2,
                      (
                        point.income
                        / maximum
                      ) * 100,
                    )}%`,
                }}
              />
            </div>

            <div className={styles.mobileValueRow}>
              <span>Despesas</span>
              <strong className={styles.negative}>
                {formatCurrency(
                  point.expense,
                )}
              </strong>
            </div>

            <div className={styles.mobileTrack}>
              <div
                className={styles.mobileExpenseValue}
                style={{
                  width:
                    `${Math.max(
                      2,
                      (
                        point.expense
                        / maximum
                      ) * 100,
                    )}%`,
                }}
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}


export function ExpenseDonutChart({
  data,
  emptyMessage,
}: NamedAmountChartProps) {
  const visibleData =
    data.slice(0, 8);

  if (visibleData.length === 0) {
    return (
      <p className={styles.empty}>
        {emptyMessage}
      </p>
    );
  }

  let accumulated = 0;

  const segments =
    visibleData.map(
      (item, index) => {
        const start = accumulated;
        accumulated +=
          item.percentage;

        return (
          `${donutColors[
            index
            % donutColors.length
          ]} ${start}% `
          + `${accumulated}%`
        );
      },
    );

  return (
    <div className={styles.donutLayout}>
      <div
        className={styles.donut}
        style={{
          background:
            `conic-gradient(${segments.join(
              ", ",
            )})`,
        }}
        aria-label="Distribuição das despesas"
      >
        <div className={styles.donutCenter}>
          <strong>
            {visibleData.length}
          </strong>
          <span>grupos</span>
        </div>
      </div>

      <div className={styles.donutLegend}>
        {visibleData.map(
          (item, index) => (
            <div
              className={styles.legendItem}
              key={item.id}
            >
              <i
                style={{
                  background:
                    donutColors[
                      index
                      % donutColors.length
                    ],
                }}
              />

              <span>{item.label}</span>

              <strong>
                {formatCurrency(
                  item.value,
                )}
              </strong>

              <small>
                {item.percentage.toFixed(
                  1,
                )}%
              </small>
            </div>
          ),
        )}
      </div>
    </div>
  );
}


export function HorizontalAmountChart({
  data,
  emptyMessage,
}: NamedAmountChartProps) {
  const visibleData =
    data.slice(0, 8);

  const maximum = Math.max(
    ...visibleData.map(
      (item) => item.value,
    ),
    1,
  );

  if (visibleData.length === 0) {
    return (
      <p className={styles.empty}>
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={styles.horizontalList}>
      {visibleData.map((item) => (
        <div
          className={styles.horizontalItem}
          key={item.id}
        >
          <div className={styles.horizontalHeader}>
            <span>{item.label}</span>

            <strong>
              {formatCurrency(
                item.value,
              )}
            </strong>
          </div>

          <div className={styles.horizontalTrack}>
            <div
              className={styles.horizontalValue}
              style={{
                width:
                  `${Math.max(
                    2,
                    (
                      item.value
                      / maximum
                    ) * 100,
                  )}%`,
              }}
            />
          </div>

          <small>
            {item.count} movimentação
            {item.count === 1
              ? ""
              : "ões"}
          </small>
        </div>
      ))}
    </div>
  );
}
