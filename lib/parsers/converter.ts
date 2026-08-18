import type { MapeamentoColunas } from "./colunas";
import { detectarMoeda, normalizarData, normalizarValor } from "./normalizar";

export type LinhaConvertida = {
  data: string;
  descricaoBruta: string;
  /** Valor com sinal (negativo = gasto), na moeda original — igual a BRL se `moedaOriginal` for null. */
  valor: number;
  moedaOriginal: string | null;
};

/**
 * Converte as linhas brutas da planilha (CSV/XLSX) em transações candidatas,
 * já resolvendo os dois padrões de coluna de valor suportados (ver
 * telas/interface-extrato.md): valor único assinado, ou crédito/débito
 * separados. Linha sem data/descrição válida, ou sem nenhum valor de
 * movimentação, é descartada (não vira transação).
 */
export function converterLinhas(
  linhas: string[][],
  mapeamento: MapeamentoColunas
): LinhaConvertida[] {
  const resultado: LinhaConvertida[] = [];

  for (const linha of linhas) {
    const descricaoBruta = (linha[mapeamento.descricao] ?? "").trim();
    const data = normalizarData(linha[mapeamento.data] ?? "");
    if (!data || !descricaoBruta) continue;

    let valor: number | null = null;
    let moedaOriginal: string | null = null;

    if (mapeamento.valor !== null) {
      const textoValor = linha[mapeamento.valor] ?? "";
      valor = normalizarValor(textoValor);
      if (valor === null) continue;
      moedaOriginal = detectarMoeda(textoValor);
    } else {
      const textoDebito =
        mapeamento.debito !== null ? linha[mapeamento.debito] ?? "" : "";
      const textoCredito =
        mapeamento.credito !== null ? linha[mapeamento.credito] ?? "" : "";
      const debito = normalizarValor(textoDebito);
      const credito = normalizarValor(textoCredito);

      if (debito !== null && debito !== 0) {
        valor = -Math.abs(debito);
        moedaOriginal = detectarMoeda(textoDebito);
      } else if (credito !== null && credito !== 0) {
        valor = Math.abs(credito);
        moedaOriginal = detectarMoeda(textoCredito);
      } else {
        continue;
      }
    }

    if (valor === null) continue;
    resultado.push({ data, descricaoBruta, valor, moedaOriginal });
  }

  return resultado;
}
