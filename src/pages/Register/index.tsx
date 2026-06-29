import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { useAuth } from "../../contexts/AuthContext";
import { ApiError } from "../../services/api";

import styles from "./styles.module.css";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (
      !password.split("").some((character) => /[A-Za-z]/.test(character)) ||
      !password.split("").some((character) => /\d/.test(character))
    ) {
      setError("A senha deve conter pelo menos uma letra e um número.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name,
        email,
        password,
      });

      navigate("/access-pending", { replace: true });
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Ocorreu um erro inesperado.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card
      title="Solicitar acesso"
      description="O Prumo está em uma fase beta com aprovação manual."
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        {error ? (
          <div className={styles.error} role="alert">
            {error}
          </div>
        ) : null}

        <Input
          label="Nome"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          minLength={2}
        />

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
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          hint="Mínimo de 8 caracteres, com uma letra e um número."
          required
          minLength={8}
        />

        <Button
          type="submit"
          fullWidth
          isLoading={isSubmitting}
        >
          Solicitar acesso
        </Button>

        <p className={styles.footer}>
          Já possui uma conta? <Link to="/login">Entrar</Link>
        </p>
      </form>
    </Card>
  );
}
