import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { useAuth } from "../../contexts/AuthContext";
import { ApiError } from "../../services/api";


import styles from "./styles.module.css";

type LocationState = {
  from?: string;
};

function getAccessStatusRoute(message: string): string | null {
  const normalized = message.toLowerCase();

  if (normalized.includes("pending")) {
    return "/access-pending";
  }

  if (normalized.includes("rejected")) {
    return "/access-rejected";
  }

  if (normalized.includes("suspended")) {
    return "/access-suspended";
  }

  return null;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const currentUser = await login({
        email,
        password,
        device_name:
          navigator.userAgent,
      });
      
      const state =
        location.state as LocationState | null;
      
      if (
        currentUser.must_change_password
      ) {
        navigate(
          "/change-temporary-password",
          {
            replace: true,
          },
        );
      
        return;
      }
      
      if (
        state?.from
        && state.from
          !== "/change-temporary-password"
      ) {
        navigate(
          state.from,
          {
            replace: true,
          },
        );
      
        return;
      }
      
      try {
        
      
        navigate(
          preferences.default_page,
          {
            replace: true,
          },
        );
      } catch {
        navigate(
          "/home",
          {
            replace: true,
          },
        );
      }
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        const accessStatusRoute = getAccessStatusRoute(caughtError.message);

        if (accessStatusRoute) {
          navigate(accessStatusRoute, { replace: true });
          return;
        }

        setError(caughtError.message);
      } else {
        setError("Ocorreu um erro inesperado.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card
      title="Entrar no Prumo"
      description="Acesse sua vida financeira em um só lugar."
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        {error ? (
          <div className={styles.error} role="alert">
            {error}
          </div>
        ) : null}

        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <Input
          label="Senha"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <Button
          type="submit"
          fullWidth
          isLoading={isSubmitting}
        >
          Entrar
        </Button>

        <p className={styles.footer}>
          Ainda não possui acesso?{" "}
          <Link to="/register">Solicitar acesso</Link>
        </p>
      </form>
    </Card>
  );
}
