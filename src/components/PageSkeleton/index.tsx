import styles from "./styles.module.css";


type PageSkeletonProps = {
  cards?: number;
  rows?: number;
};


export function PageSkeleton({
  cards = 4,
  rows = 5,
}: PageSkeletonProps) {
  return (
    <div
      className={styles.page}
      aria-label="Carregando conteúdo"
      aria-busy="true"
    >
      <div
        className={styles.header}
      >
        <span />
        <span />
      </div>

      <div
        className={styles.cards}
      >
        {Array.from({
          length: cards,
        }).map((_, index) => (
          <article
            key={index}
            className={styles.card}
          >
            <span />
            <strong />
            <small />
          </article>
        ))}
      </div>

      <div
        className={styles.table}
      >
        {Array.from({
          length: rows,
        }).map((_, index) => (
          <div key={index}>
            <span />
            <span />
            <span />
          </div>
        ))}
      </div>
    </div>
  );
}
