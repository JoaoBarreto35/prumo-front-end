import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router";

import { planningService } from "../../services/planningService";
import { transactionService } from "../../services/transactionService";
import type { PlanningScenario } from "../../types/planning";
import type { Transaction } from "../../types/transactions";
import {
  buildProjection,
  summarizeProjection,
} from "../../utils/projection";
import { formatCurrency } from "../../utils/currency";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Card } from "../Card";

import styles from "./styles.module.css";


const BALANCE_STORAGE_KEY = (
  "prumo-planning-initial-balance"
);


export function PlanningPreview() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [scenarios, setScenarios] = useState<PlanningScenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  const loadData = useCallback(async () => {
    setIsLoading(true);

    try {
      const [transactionsData, scenariosData] = await Promise.all([
        transactionService.listTransactions({ limit: 500 }),
        planningService.list(),
      ]);
      setTransactions(transactionsData);
      setScenarios(scenariosData);
    } catch {
      setTransactions([]);
      setScenarios([]);
    } finally {
      setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    void loadData();
  }, [loadData]);


  const projection = useMemo(
    () => buildProjection(
      transactions,
      scenarios.filter((scenario) => scenario.is_active),
      3,
      Number(
        localStorage.getItem(BALANCE_STORAGE_KEY)
        ?? 0,
      ),
    ),
    [scenarios, transactions],
  );


  const summary = useMemo(
    () => summarizeProjection(
      projection,
      scenarios.filter((scenario) => scenario.is_active).length,
    ),
    [projection, scenarios],
  );


  return (
    <Card
      title="Projeção dos próximos 3 meses"
      description="Veja o impacto dos cenários antes de assumir novos compromissos."
    >
      {isLoading ? (
        <p className={styles.loading}>Calculando projeção...</p>
      ) : (
        <div className={styles.content}>
          <div className={styles.summary}>
            <div>
              <span>Saldo ao final</span>
              <strong
                className={
                  summary.finalBalance >= 0
                    ? styles.positive
                    : styles.negative
                }
              >
                {formatCurrency(summary.finalBalance)}
              </strong>
            </div>

            <div>
              <span>Cenários ativos</span>
              <strong>{summary.activeScenarioCount}</strong>
            </div>

            <div>
              <span>Diagnóstico</span>
              <Badge
                variant={
                  summary.verdict === "comfortable"
                    ? "positive"
                    : summary.verdict === "attention"
                      ? "warning"
                      : "negative"
                }
              >
                {summary.verdict === "comfortable"
                  ? "Confortável"
                  : summary.verdict === "attention"
                    ? "Atenção"
                    : "Risco alto"}
              </Badge>
            </div>
          </div>

          <div className={styles.months}>
            {projection.map((month) => (
              <div key={month.key}>
                <span>{month.label}</span>
                <strong
                  className={
                    month.accumulatedBalance >= 0
                      ? styles.positive
                      : styles.negative
                  }
                >
                  {formatCurrency(month.accumulatedBalance)}
                </strong>
              </div>
            ))}
          </div>

          <div className={styles.action}>
            <Button
              variant="tertiary"
              onClick={() => navigate("/planning")}
            >
              Abrir planejamento
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
