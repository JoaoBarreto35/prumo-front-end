import {
  useEffect,
  useState,
} from "react";

import styles from "./styles.module.css";


export function NetworkStatus() {
  const [isOnline, setIsOnline] =
    useState(
      navigator.onLine,
    );

  const [
    showRecovered,
    setShowRecovered,
  ] = useState(false);


  useEffect(() => {
    let recoveryTimer:
      number | undefined;

    function handleOnline() {
      setIsOnline(true);
      setShowRecovered(true);

      recoveryTimer =
        window.setTimeout(
          () =>
            setShowRecovered(
              false,
            ),
          3000,
        );
    }

    function handleOffline() {
      setIsOnline(false);
      setShowRecovered(false);
    }

    window.addEventListener(
      "online",
      handleOnline,
    );
    window.addEventListener(
      "offline",
      handleOffline,
    );

    return () => {
      window.removeEventListener(
        "online",
        handleOnline,
      );
      window.removeEventListener(
        "offline",
        handleOffline,
      );

      if (recoveryTimer) {
        window.clearTimeout(
          recoveryTimer,
        );
      }
    };
  }, []);


  if (
    isOnline
    && !showRecovered
  ) {
    return null;
  }


  return (
    <div
      className={[
        styles.banner,
        isOnline
          ? styles.online
          : styles.offline,
      ].join(" ")}
      role="status"
      aria-live="polite"
    >
      <span
        aria-hidden="true"
      >
        {isOnline ? "✓" : "!"}
      </span>

      <p>
        {isOnline
          ? "Conexão restabelecida."
          : "Você está sem conexão. Algumas ações podem não funcionar."}
      </p>
    </div>
  );
}
