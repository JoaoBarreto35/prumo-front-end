import {
  useNavigate,
} from "react-router";

import { Button } from "../../components/Button";

import styles from "./styles.module.css";


export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main
      className={styles.page}
    >
      <section
        className={styles.card}
      >
        <span
          className={styles.code}
        >
          404
        </span>

        <h1>
          Esta página saiu do rumo
        </h1>

        <p>
          O endereço pode estar
          incorreto ou a página foi
          movida. Volte para a Home
          e continue organizando sua
          vida financeira.
        </p>

        <div
          className={styles.actions}
        >
          <Button
            variant="secondary"
            onClick={() =>
              navigate(-1)
            }
          >
            Voltar
          </Button>

          <Button
            onClick={() =>
              navigate(
                "/home",
                {
                  replace: true,
                },
              )
            }
          >
            Ir para a Home
          </Button>
        </div>
      </section>
    </main>
  );
}
