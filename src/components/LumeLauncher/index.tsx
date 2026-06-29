import { useNavigate } from "react-router";

import styles from "./styles.module.css";

export function LumeLauncher() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className={styles.launcher}
      onClick={() => navigate("/lume")}
      aria-label="Abrir o Lume"
      title="Abrir o Lume"
    >
      <span aria-hidden="true">✦</span>
    </button>
  );
}