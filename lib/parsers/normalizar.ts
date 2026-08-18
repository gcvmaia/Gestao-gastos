import { formatISO, isValid, parse } from "date-fns";

const FORMATOS_DATA = [
  "dd/MM/yyyy",
  "yyyy-MM-dd",
  "dd-MM-yyyy",
  "MM/dd/yyyy",
  "dd/MM/yy",
];

/** Converte texto de data em vários formatos comuns pra ISO (yyyy-MM-dd). */
export function normalizarData(valorBruto: string): string | null {
  const texto = valorBruto.trim();
  if (!texto) return null;

  if (texto.includes("T")) {
    const comoData = new Date(texto);
    if (isValid(comoData)) {
      return formatISO(comoData, { representation: "date" });
    }
  }

  for (const formato of FORMATOS_DATA) {
    const parsed = parse(texto, formato, new Date());
    if (isValid(parsed)) {
      return formatISO(parsed, { representation: "date" });
    }
  }

  return null;
}

const SIMBOLOS_MOEDA: Array<[string, string]> = [
  ["€", "EUR"],
  ["eur", "EUR"],
  ["us$", "USD"],
  ["$", "USD"],
  ["usd", "USD"],
  ["£", "GBP"],
  ["gbp", "GBP"],
];

/**
 * Heurística simples pra detectar moeda estrangeira num valor de texto (ex:
 * "€ 45,00" ou "USD 12.50"). O formato do arquivo de extrato não define uma
 * coluna dedicada de moeda, então isso é inferido do próprio texto do valor;
 * sem símbolo reconhecido, assume BRL (retorna null).
 */
export function detectarMoeda(valorBruto: string): string | null {
  const texto = valorBruto.trim().toLowerCase();
  for (const [simbolo, codigo] of SIMBOLOS_MOEDA) {
    if (texto.includes(simbolo)) return codigo;
  }
  return null;
}

/** Converte texto de valor monetário (BRL ou com símbolo estrangeiro) pra número. */
export function normalizarValor(valorBruto: string): number | null {
  const texto = valorBruto.trim();
  if (!texto) return null;

  let limpo = texto.replace(/[^\d,.-]/g, "");
  if (!limpo) return null;

  // Formato brasileiro (milhar com ponto, decimal com vírgula): 1.234,56
  if (/,\d{1,2}$/.test(limpo)) {
    limpo = limpo.replace(/\./g, "").replace(",", ".");
  } else {
    // Milhar com vírgula, sem parte decimal em vírgula: 1,234
    limpo = limpo.replace(/,/g, "");
  }

  const numero = Number.parseFloat(limpo);
  return Number.isFinite(numero) ? numero : null;
}
