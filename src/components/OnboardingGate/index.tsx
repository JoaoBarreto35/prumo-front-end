import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router";

import {
  onboardingService,
} from "../../services/onboardingService";
import {
  FullPageLoader,
} from "../FullPageLoader";

import styles from "./styles.module.css";


export function OnboardingGate() {
  const location =
    useLocation();

  const [needsOnboarding, setNeedsOnboarding] =
    useState<boolean | null>(
      null,
    );

  const [error, setError] =
    useState("");


  const loadStatus =
    useCallback(async () => {
      setError("");

      try {
        const state =
          await onboardingService
            .get();

        setNeedsOnboarding(
          state.needs_onboarding,
        );
      } catch {
        setError(
          "Não foi possível verificar "
          + "a configuração inicial.",
        );
      }
    }, []);


  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);


  if (error) {
    return (
      <main
        className={styles.page}
      >
        <section>
          <strong>
            Falha ao abrir o Prumo
          </strong>

          <p>{error}</p>

          <button
            type="button"
            onClick={() =>
              void loadStatus()
            }
          >
            Tentar novamente
          </button>
        </section>
      </main>
    );
  }


  if (
    needsOnboarding === null
  ) {
    return <FullPageLoader />;
  }


  if (needsOnboarding) {
    return (
      <Navigate
        to="/onboarding"
        replace
        state={{
          from: location,
        }}
      />
    );
  }


  return <Outlet />;
}
