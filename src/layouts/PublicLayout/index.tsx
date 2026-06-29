import { Outlet } from "react-router";

import styles from "./styles.module.css";

export function PublicLayout() {
  return (
    <div className={styles.layout}>
      <div className={styles.brandArea}>
        <div className={styles.symbol}>P</div>

        <div>
          <strong>Prumo</strong>
          <span>Aprumando sua vida financeira.</span>
        </div>
      </div>

      <section className={styles.content}>
        <Outlet />
      </section>
    </div>
  );
}