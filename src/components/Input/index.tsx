import { forwardRef, type InputHTMLAttributes } from "react";
import styles from "./styles.module.css";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = "", ...props }, ref) => {
    const inputId = id ?? `input-${label.toLowerCase().replaceAll(" ", "-")}`;
    const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

    return (
      <div className={styles.field}>
        <label className={styles.label} htmlFor={inputId}>{label}</label>
        <input
          {...props}
          ref={ref}
          id={inputId}
          className={[styles.input, error ? styles.invalid : "", className].filter(Boolean).join(" ")}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        />
        {error ? (
          <span id={`${inputId}-error`} className={styles.error}>{error}</span>
        ) : hint ? (
          <span id={`${inputId}-hint`} className={styles.hint}>{hint}</span>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
