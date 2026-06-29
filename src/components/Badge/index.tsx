import type { HTMLAttributes, ReactNode } from "react";
import styles from "./styles.module.css";

type BadgeVariant = "neutral" | "positive" | "negative" | "warning" | "info";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  variant?: BadgeVariant;
};

export function Badge({ children, variant = "neutral", className = "", ...props }: BadgeProps) {
  return (
    <span {...props} className={[styles.badge, styles[variant], className].filter(Boolean).join(" ")}>
      {children}
    </span>
  );
}
