import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { useTheme } from "../../contexts/ThemeContext";
import styles from "./styles.module.css";

export function DesignSystemPage() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>Prumo UI</span>
          <h1>Design System</h1>
          <p>Base visual inicial do Prumo. Tema atual: {theme} ({resolvedTheme}).</p>
        </div>

        <div className={styles.themeActions}>
          <Button variant="secondary" onClick={() => setTheme("light")}>Claro</Button>
          <Button variant="secondary" onClick={() => setTheme("dark")}>Escuro</Button>
          <Button variant="secondary" onClick={() => setTheme("system")}>Sistema</Button>
        </div>
      </header>

      <section className={styles.grid}>
        <Card title="Botões" description="Ações primárias, secundárias e destrutivas.">
          <div className={styles.inline}>
            <Button>Salvar</Button>
            <Button variant="secondary">Exportar</Button>
            <Button variant="tertiary">Cancelar</Button>
            <Button variant="danger">Excluir</Button>
          </div>
        </Card>

        <Card title="Status" description="Estados semânticos reutilizáveis.">
          <div className={styles.inline}>
            <Badge variant="positive">Concluído</Badge>
            <Badge variant="warning">Pendente</Badge>
            <Badge variant="negative">Atrasado</Badge>
            <Badge variant="info">Previsto</Badge>
            <Badge>Cancelado</Badge>
          </div>
        </Card>

        <Card title="Campos" description="Inputs com ajuda e validação.">
          <div className={styles.fields}>
            <Input label="Descrição" placeholder="Ex.: Mercado do mês" hint="Use uma descrição curta." />
            <Input label="Valor" placeholder="R$ 0,00" error="Informe um valor válido." />
          </div>
        </Card>

        <Card title="Resumo financeiro" description="Exemplo de card do produto.">
          <div className={styles.financialCard}>
            <span>Saldo previsto</span>
            <strong>R$ 4.380,75</strong>
            <small>12,6% acima do mês anterior</small>
          </div>
        </Card>

        <Card title="Lume" description="Presença visual inicial do assistente.">
          <div className={styles.lumePreview}>
            <div className={styles.lumeOrb} aria-hidden="true">✦</div>
            <div>
              <strong>Como está meu mês?</strong>
              <p>O Lume ficará disponível para registros, análises e ações.</p>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
