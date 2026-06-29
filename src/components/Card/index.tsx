import type { HTMLAttributes, ReactNode } from "react";
import styles from "./styles.module.css";

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  title?: string;
  description?: string;
};

export function Card({ children, title, description, className = "", ...props }: CardProps) {
  return (
    <section {...props} className={[styles.card, className].filter(Boolean).join(" ")}>
      {title || description ? (
        <header className={styles.header}>
          {title ? <h2>{title}</h2> : null}
          {description ? <p>{description}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
