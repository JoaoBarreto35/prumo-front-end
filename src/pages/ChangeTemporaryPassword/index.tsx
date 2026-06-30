import {
  useState,
  type FormEvent,
} from "react";
import {
  useNavigate,
} from "react-router";

import { Button } from "../../components/Button";
import { useAuth } from "../../contexts/AuthContext";
import { ApiError } from "../../services/api";
import {
  readPreferencesCache,
  settingsService,
} from "../../services/settingsService";

import styles from "./styles.module.css";


export function ChangeTemporaryPasswordPage() {
  const navigate = useNavigate();

  const {
    user,
    refreshUser,
  } = useAuth();

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmation, setConfirmation] =
    useState("");

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState("");


  async function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      await settingsService
        .changePassword({
          current_password:
            currentPassword,
          new_password: newPassword,
          confirm_password:
            confirmation,
        });

      await refreshUser();

      const cached =
        readPreferencesCache();

      let defaultPage =
        cached?.default_page
        ?? "/home";

      try {
        const preferences =
          await settingsService
            .getPreferences();

        defaultPage =
          preferences.default_page;
      } catch {
        // Mantém o fallback local.
      }

      navigate(
        defaultPage,
        {
          replace: true,
        },
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível alterar a senha.",
      );
    } finally {
      setIsSaving(false);
    }
  }


  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.identity}>
          <span>△</span>
          <strong>Prumo</strong>
        </div>

        <div className={styles.heading}>
          <span>Primeiro acesso</span>
          <h1>Crie sua senha pessoal</h1>
          <p>
            Olá, {user?.name}. Antes de
            continuar, substitua a senha
            temporária por uma senha só sua.
          </p>
        </div>

        {error ? (
          <div className={styles.error}>
            {error}
          </div>
        ) : null}

        <form
          className={styles.form}
          onSubmit={(event) =>
            void handleSubmit(event)
          }
        >
          <label>
            <span>Senha temporária</span>
            <input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              required
              onChange={(event) =>
                setCurrentPassword(
                  event.target.value,
                )
              }
            />
          </label>

          <label>
            <span>Nova senha</span>
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={newPassword}
              required
              onChange={(event) =>
                setNewPassword(
                  event.target.value,
                )
              }
            />
          </label>

          <label>
            <span>
              Confirmar nova senha
            </span>
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={confirmation}
              required
              onChange={(event) =>
                setConfirmation(
                  event.target.value,
                )
              }
            />
          </label>

          <p className={styles.helper}>
            Use pelo menos oito caracteres,
            com letra maiúscula, minúscula
            e número.
          </p>

          <Button
            type="submit"
            isLoading={isSaving}
          >
            Salvar e continuar
          </Button>
        </form>
      </section>
    </main>
  );
}
