import {
  useClosingMonthStatus,
} from "../../hooks/useClosingMonthStatus";

import styles from "./styles.module.css";


export function ClosedMonthWarning({
  referenceDate,
}: {
  referenceDate:
    string | null | undefined;
}) {
  const {
    status,
    isLoading,
  } = useClosingMonthStatus(
    referenceDate,
  );


  if (
    isLoading
    || !status?.is_closed
  ) {
    return null;
  }


  return (
    <aside
      className={styles.warning}
      role="alert"
    >
      <span aria-hidden="true">
        !
      </span>

      <div>
        <strong>
          Mês fechado
        </strong>

        <p>
          {status.warning}
        </p>
      </div>
    </aside>
  );
}
