import { Button } from "../Button";

import styles from "./styles.module.css";

type PageStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function PageState({
  title,
  description,
  actionLabel,
  onAction,
}: PageStateProps) {
  return (
    <div className={styles.state}>
      <span aria-hidden="true">✦</span>
      <strong>{title}</strong>
      <p>{description}</p>

      {actionLabel && onAction ? (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
