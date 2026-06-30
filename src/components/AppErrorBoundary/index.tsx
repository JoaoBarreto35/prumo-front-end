import {
  Component,
  type ErrorInfo,
  type ReactNode,
} from "react";

import styles from "./styles.module.css";


type Props = {
  children: ReactNode;
};


type State = {
  hasError: boolean;
  errorId: string | null;
};


function createErrorId(): string {
  return (
    globalThis.crypto
      ?.randomUUID?.()
    ?? `error-${Date.now()}`
  );
}


export class AppErrorBoundary
  extends Component<Props, State> {
  state: State = {
    hasError: false,
    errorId: null,
  };


  static getDerivedStateFromError():
    State {
    return {
      hasError: true,
      errorId: createErrorId(),
    };
  }


  componentDidCatch(
    error: Error,
    errorInfo: ErrorInfo,
  ) {
    console.error(
      "Erro não tratado no Prumo",
      {
        error,
        errorInfo,
        errorId:
          this.state.errorId,
      },
    );
  }


  private reloadPage = () => {
    window.location.reload();
  };


  private goHome = () => {
    window.location.assign(
      "/home",
    );
  };


  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main
        className={styles.page}
        role="alert"
      >
        <section
          className={styles.card}
        >
          <span
            className={styles.icon}
            aria-hidden="true"
          >
            !
          </span>

          <div
            className={
              styles.content
            }
          >
            <span
              className={
                styles.eyebrow
              }
            >
              O Prumo encontrou um erro
            </span>

            <h1>
              Não conseguimos exibir
              esta tela
            </h1>

            <p>
              Seus dados não foram
              apagados. Atualize a página
              para tentar novamente ou
              volte para a Home.
            </p>

            {this.state.errorId ? (
              <small>
                Referência:{" "}
                <code>
                  {
                    this.state
                      .errorId
                  }
                </code>
              </small>
            ) : null}
          </div>

          <div
            className={
              styles.actions
            }
          >
            <button
              type="button"
              className={
                styles.secondary
              }
              onClick={this.goHome}
            >
              Voltar para a Home
            </button>

            <button
              type="button"
              className={
                styles.primary
              }
              onClick={this.reloadPage}
            >
              Atualizar página
            </button>
          </div>
        </section>
      </main>
    );
  }
}
