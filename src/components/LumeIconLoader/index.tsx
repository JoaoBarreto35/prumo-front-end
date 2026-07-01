import styles from "./styles.module.css";

type LumeIconLoader = {
  title : string;
}

export function LumeIconLoader({title}:LumeIconLoader) {
  return (
    <main className={styles.page}>
      <div className={styles.orb} aria-hidden="true">
        ✦
      </div>
      <p>{title}</p>
    </main>
  );
}
