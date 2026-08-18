export type MapeamentoColunas = {
  data: number;
  descricao: number;
  valor: number | null;
  credito: number | null;
  debito: number | null;
};

const ALIASES: Record<
  "data" | "descricao" | "valor" | "credito" | "debito",
  string[]
> = {
  data: ["data", "date", "dt lancamento", "dt"],
  descricao: [
    "descricao",
    "description",
    "historico",
    "detalhes",
    "lancamento",
    "memo",
  ],
  valor: ["valor", "amount", "value"],
  credito: ["credito", "credit", "entrada"],
  debito: ["debito", "debit", "saida"],
};

function normalizarCabecalho(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function encontrarIndice(
  cabecalhosNormalizados: string[],
  aliases: string[]
): number | null {
  for (const alias of aliases) {
    const idx = cabecalhosNormalizados.findIndex((c) => c === alias);
    if (idx !== -1) return idx;
  }
  for (const alias of aliases) {
    const idx = cabecalhosNormalizados.findIndex((c) => c.includes(alias));
    if (idx !== -1) return idx;
  }
  return null;
}

/**
 * Detecta automaticamente qual coluna corresponde a cada campo, tentando
 * cabeçalhos em português/inglês mais comuns (ver "Decisões em Aberto" de
 * telas/interface-extrato.md). Retorna null se não conseguir identificar
 * Data+Descrição, ou nenhum dos padrões de valor (único ou crédito/débito)
 * — nesse caso o chamador deve pedir mapeamento manual ao usuário.
 */
export function detectarMapeamento(
  cabecalhos: string[]
): MapeamentoColunas | null {
  const normalizados = cabecalhos.map(normalizarCabecalho);

  const data = encontrarIndice(normalizados, ALIASES.data);
  const descricao = encontrarIndice(normalizados, ALIASES.descricao);
  const valor = encontrarIndice(normalizados, ALIASES.valor);
  const credito = encontrarIndice(normalizados, ALIASES.credito);
  const debito = encontrarIndice(normalizados, ALIASES.debito);

  if (data === null || descricao === null) return null;
  if (valor === null && credito === null && debito === null) return null;

  return { data, descricao, valor, credito, debito };
}
