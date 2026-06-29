import {
  useEffect,
  type ReactNode,
} from "react";

import styles from "./styles.module.css";

type ModalProps = {
  title: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({
  title,
  description,
  isOpen,
  onClose,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <h2 id="modal-title">{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </header>

        <div className={styles.content}>
          {children}
        </div>
      </section>
    </div>
  );
}
