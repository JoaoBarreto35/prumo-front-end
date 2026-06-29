import { Outlet } from "react-router";

import { Badge } from "../../components/Badge";

import styles from "./styles.module.css";

export function AdminLayout() {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <h1>Administração</h1>
            <Badge variant="warning">Área restrita</Badge>
          </div>

          <p>
            Gerencie acessos sem visualizar dados financeiros
            pessoais.
          </p>
        </div>
      </header>

      <Outlet />
    </div>
  );
}