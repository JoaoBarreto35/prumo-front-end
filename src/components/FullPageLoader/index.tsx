import styles from "./styles.module.css";

export function FullPageLoader() {
  return (
    <main className={styles.page}>
      <div className={styles.orb} aria-hidden="true">
        ✦
      </div>
      <p>Preparando o Prumo...</p>
    </main>
  );
}
