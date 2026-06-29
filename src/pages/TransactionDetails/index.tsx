import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router";

import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { PageState } from "../../components/PageState";
import { ApiError } from "../../services/api";
import { transactionCrudService } from "../../services/transactionCrudService";
import type { TransactionDetail } from "../../types/transactionCrud";
import { formatCurrency } from "../../utils/currency";

import styles from "./styles.module.css";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR").format(
    new Date(`${value}T12:00:00`),
  );
}

export function TransactionDetailsPage() {
  const navigate = useNavigate();
  const { transactionId } = useParams();

  const [transaction, setTransaction] =
    useState<TransactionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUpdatingGroup, setIsUpdatingGroup] = useState(false);

  const loadTransaction = useCallback(async () => {
    if (!transactionId) {
      setError("Movimentação inválida.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      setTransaction(
        await transactionCrudService.getDetail(transactionId),
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível carregar a movimentação.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    void loadTransaction();
  }, [loadTransaction]);

  async function toggleGroup() {
    if (!transaction) {
      return;
    }

    setIsUpdatingGroup(true);

    try {
      if (transaction.is_group_active) {
        await transactionCrudService.deactivateGroup(
          transaction.group_id,
        );
      } else {
        await transactionCrudService.activateGroup(
          transaction.group_id,
        );
      }

      await loadTransaction();
    } catch (caughtError) {
      window.alert(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível atualizar a recorrência.",
      );
    } finally {
      setIsUpdatingGroup(false);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <PageState
          title="Carregando movimentação"
          description="Buscando os detalhes do lançamento."
        />
      </Card>
    );
  }

  if (error || !transaction) {
    return (
      <Card>
        <PageState
          title="Não foi possível carregar"
          description={error || "Movimentação não encontrada."}
          actionLabel="Voltar"
          onAction={() => navigate("/transactions")}
        />
      </Card>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Detalhes</span>
          <h1>{transaction.description}</h1>

          <div className={styles.badges}>
            <Badge
              variant={
                transaction.transaction_type === "income"
                  ? "positive"
                  : "negative"
              }
            >
              {transaction.transaction_type === "income"
                ? "Receita"
                : "Despesa"}
            </Badge>

            <Badge variant="info">
              {transaction.group_type === "single"
                ? "Avulsa"
                : transaction.group_type === "installment"
                  ? "Parcelada"
                  : "Recorrente"}
            </Badge>
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={() => navigate("/transactions")}
          >
            Voltar
          </Button>

          <Button
            onClick={() =>
              navigate(`/transactions/${transaction.id}/edit`)
            }
          >
            Editar
          </Button>
        </div>
      </header>

      <section className={styles.grid}>
        <Card title="Resumo">
          <dl className={styles.details}>
            <div>
              <dt>Valor</dt>
              <dd>{formatCurrency(transaction.amount)}</dd>
            </div>

            <div>
              <dt>Data prevista</dt>
              <dd>{formatDate(transaction.due_date)}</dd>
            </div>

            <div>
              <dt>Status</dt>
              <dd>{transaction.status}</dd>
            </div>

            <div>
              <dt>Parcela/ocorrência</dt>
              <dd>
                {transaction.sequence_number} de{" "}
                {transaction.total_occurrences}
              </dd>
            </div>
          </dl>
        </Card>

        <Card title="Grupo">
          <dl className={styles.details}>
            <div>
              <dt>Situação</dt>
              <dd>
                {transaction.is_group_active
                  ? "Ativo"
                  : "Inativo"}
              </dd>
            </div>

            <div>
              <dt>Observações</dt>
              <dd>{transaction.notes || "Nenhuma"}</dd>
            </div>
          </dl>

          {transaction.group_type !== "single" ? (
            <div className={styles.groupAction}>
              <Button
                variant="secondary"
                isLoading={isUpdatingGroup}
                onClick={() => void toggleGroup()}
              >
                {transaction.is_group_active
                  ? "Desativar grupo"
                  : "Reativar grupo"}
              </Button>
            </div>
          ) : null}
        </Card>
      </section>
    </div>
  );
}
