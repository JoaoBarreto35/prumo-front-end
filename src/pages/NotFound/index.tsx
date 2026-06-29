import { useNavigate } from "react-router";

import { Button } from "../../components/Button";

import styles from "./styles.module.css";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className={styles.page}>
      <span className={styles.code}>404</span>

      <h1>Página não encontrada</h1>

      <p>
        O endereço informado não existe ou foi movido.
      </p>

      <Button onClick={() => navigate("/home")}>
        Voltar para a Home
      </Button>
    </main>
  );
}