export function formatCurrency(value: number | string): string {
  const numericValue =
    typeof value === "string" ? Number(value) : value;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(numericValue) ? numericValue : 0);
}

export function parseCurrencyInput(value: string): number {
  const onlyDigits = value.replace(/\D/g, "");

  if (!onlyDigits) {
    return 0;
  }

  return Number(onlyDigits) / 100;
}

export function formatCurrencyInput(value: string): string {
  return formatCurrency(parseCurrencyInput(value));
}
