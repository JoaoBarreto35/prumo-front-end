import { Card } from "../../components/Card";

import styles from "./styles.module.css";

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.eyebrow}>Prumo</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>

      <Card
        title="Página em construção"
        description="A estrutura da rota já está funcionando."
      >
        <div className={styles.placeholder}>
          <span aria-hidden="true">✦</span>

          <p>
            O conteúdo real desta página será desenvolvido nas
            próximas fases.
          </p>
        </div>
      </Card>
    </div>
  );
}