import { Link } from "react-router";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";

import styles from "./styles.module.css";

type AccessStatusPageProps = {
  title: string;
  description: string;
  symbol?: string;
};

export function AccessStatusPage({
  title,
  description,
  symbol = "✦",
}: AccessStatusPageProps) {
  return (
    <Card>
      <div className={styles.content}>
        <div className={styles.symbol} aria-hidden="true">
          {symbol}
        </div>

        <h1>{title}</h1>
        <p>{description}</p>

        <Button
          variant="secondary"
          onClick={() => window.location.assign("/login")}
        >
          Voltar para o login
        </Button>

        <Link className={styles.homeLink} to="/">
          Ir para o início
        </Link>
      </div>
    </Card>
  );
}
