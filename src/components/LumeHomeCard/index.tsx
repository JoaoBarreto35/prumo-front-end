import {
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router";

import { ApiError } from "../../services/api";
import { lumeService } from "../../services/lumeService";
import type {
  LumeSummary,
} from "../../types/lume";
import {
  formatCurrency,
} from "../../utils/currency";
import { Button } from "../Button";
import { Card } from "../Card";

import styles from "./styles.module.css";


export function LumeHomeCard() {
  const navigate = useNavigate();

  const [summary, setSummary] =
    useState<LumeSummary | null>(
      null,
    );

  const [error, setError] =
    useState("");


  useEffect(() => {
    let isMounted = true;

    lumeService
      .getSummary()
      .then((data) => {
        if (isMounted) {
          setSummary(data);
        }
      })
      .catch((caughtError) => {
        if (!isMounted) {
          return;
        }

        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "Não foi possível carregar o resumo do Lume.",
        );
      });

    return () => {
      isMounted = false;
    };
  }, []);


  if (error) {
    return null;
  }


  return (
    <Card>
      <section
        className={styles.wrapper}
      >
        <div
          className={
            styles.identity
          }
        >
          <span
            className={styles.icon}
          >
            ✦
          </span>

          <div>
            <span
              className={
                styles.eyebrow
              }
            >
              Lume
            </span>

            <h2>
              Seu olhar inteligente
            </h2>
          </div>
        </div>

        {summary ? (
          <>
            <p
              className={
                styles.insight
              }
            >
              {summary.insight}
            </p>

            <div
              className={
                styles.metrics
              }
            >
              <div>
                <span>
                  Próximos 7 dias
                </span>
                <strong>
                  {formatCurrency(
                    summary
                      .upcoming_7_days,
                  )}
                </strong>
              </div>

              <div>
                <span>Pendências</span>
                <strong>
                  {
                    summary
                      .pending_count
                  }
                </strong>
              </div>

              <div>
                <span>Atrasadas</span>
                <strong
                  className={
                    summary
                      .overdue_count > 0
                      ? styles.danger
                      : ""
                  }
                >
                  {
                    summary
                      .overdue_count
                  }
                </strong>
              </div>
            </div>

            <div
              className={
                styles.suggestions
              }
            >
              {summary.suggestions
                .slice(0, 2)
                .map(
                  (suggestion) => (
                    <button
                      type="button"
                      key={suggestion}
                      onClick={() =>
                        navigate(
                          "/lume",
                          {
                            state: {
                              initialMessage:
                                suggestion,
                            },
                          },
                        )
                      }
                    >
                      {suggestion}
                    </button>
                  ),
                )}
            </div>
          </>
        ) : (
          <p
            className={
              styles.loading
            }
          >
            Organizando seus dados...
          </p>
        )}

        <Button
          variant="secondary"
          onClick={() =>
            navigate("/lume")
          }
        >
          Conversar com o Lume
        </Button>
      </section>
    </Card>
  );
}
