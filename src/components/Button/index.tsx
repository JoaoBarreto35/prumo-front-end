import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./styles.module.css";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger";
type ButtonSize = "small" | "medium" | "large";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
};

export function Button({
  children,
  variant = "primary",
  size = "medium",
  fullWidth = false,
  isLoading = false,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <button
      {...props}
      className={classes}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
    >
      {isLoading ? "Carregando..." : children}
    </button>
  );
}
