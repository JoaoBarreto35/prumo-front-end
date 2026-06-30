import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import styles from "./styles.module.css";


export type ToastType =
  | "success"
  | "error"
  | "warning"
  | "info";


export type ToastInput = {
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;
};


type ToastItem = Required<
  Pick<
    ToastInput,
    "message" | "type"
  >
> & {
  id: string;
  title?: string;
  duration: number;
};


type ToastContextValue = {
  showToast: (
    input: ToastInput,
  ) => string;
  dismissToast: (
    id: string,
  ) => void;
};


const ToastContext =
  createContext<
    ToastContextValue | undefined
  >(undefined);


function createToastId(): string {
  return (
    globalThis.crypto
      ?.randomUUID?.()
    ?? `toast-${Date.now()}-${Math.random()}`
  );
}


function inferAlertType(
  message: string,
): ToastType {
  const normalized =
    message.toLocaleLowerCase(
      "pt-BR",
    );

  if (
    normalized.includes(
      "não foi possível",
    )
    || normalized.includes("erro")
    || normalized.includes("falhou")
    || normalized.includes(
      "inválid",
    )
  ) {
    return "error";
  }

  if (
    normalized.includes(
      "sucesso",
    )
    || normalized.includes(
      "concluíd",
    )
    || normalized.includes(
      "salv",
    )
  ) {
    return "success";
  }

  if (
    normalized.includes(
      "atenção",
    )
    || normalized.includes(
      "pendente",
    )
  ) {
    return "warning";
  }

  return "info";
}


export function ToastProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [toasts, setToasts] =
    useState<ToastItem[]>([]);

  const timersRef = useRef(
    new Map<
      string,
      number
    >(),
  );


  const dismissToast =
    useCallback(
      (id: string) => {
        const timer =
          timersRef.current.get(id);

        if (timer) {
          window.clearTimeout(timer);
          timersRef.current.delete(id);
        }

        setToasts(
          (current) =>
            current.filter(
              (toast) =>
                toast.id !== id,
            ),
        );
      },
      [],
    );


  const showToast =
    useCallback(
      (
        input: ToastInput,
      ): string => {
        const id =
          createToastId();

        const toast: ToastItem = {
          id,
          title: input.title,
          message: input.message,
          type:
            input.type ?? "info",
          duration:
            input.duration ?? 5000,
        };

        setToasts(
          (current) => [
            ...current.slice(-3),
            toast,
          ],
        );

        if (toast.duration > 0) {
          const timer =
            window.setTimeout(
              () =>
                dismissToast(id),
              toast.duration,
            );

          timersRef.current.set(
            id,
            timer,
          );
        }

        return id;
      },
      [dismissToast],
    );


  useEffect(() => {
    const nativeAlert =
      window.alert.bind(window);

    window.alert = (
      value?: unknown,
    ) => {
      const message =
        String(value ?? "");

      if (!message.trim()) {
        return;
      }

      showToast({
        message,
        type:
          inferAlertType(message),
      });
    };

    return () => {
      window.alert = nativeAlert;

      timersRef.current
        .forEach(
          (timer) =>
            window.clearTimeout(
              timer,
            ),
        );

      timersRef.current.clear();
    };
  }, [showToast]);


  const value = useMemo(
    () => ({
      showToast,
      dismissToast,
    }),
    [
      dismissToast,
      showToast,
    ],
  );


  return (
    <ToastContext.Provider
      value={value}
    >
      {children}

      <div
        className={styles.viewport}
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map(
          (toast) => (
            <article
              key={toast.id}
              className={[
                styles.toast,
                styles[toast.type],
              ].join(" ")}
              role={
                toast.type
                === "error"
                  ? "alert"
                  : "status"
              }
            >
              <span
                className={
                  styles.indicator
                }
                aria-hidden="true"
              />

              <div
                className={
                  styles.content
                }
              >
                {toast.title ? (
                  <strong>
                    {toast.title}
                  </strong>
                ) : null}

                <p>
                  {toast.message}
                </p>
              </div>

              <button
                type="button"
                aria-label="Fechar aviso"
                onClick={() =>
                  dismissToast(
                    toast.id,
                  )
                }
              >
                ×
              </button>
            </article>
          ),
        )}
      </div>
    </ToastContext.Provider>
  );
}


export function useToast():
  ToastContextValue {
  const context =
    useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToast deve ser usado dentro de ToastProvider.",
    );
  }

  return context;
}
