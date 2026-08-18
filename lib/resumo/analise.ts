import type { ResumoPayload } from "./calculos";

/**
 * Texto de análise 100% calculado localmente, sem chamada a API externa de
 * IA (ver telas/interface-resumo.md). Se adapta quando não há dado
 * suficiente pra alguma comparação (ex: só um mês importado).
 */
export function gerarTextoAnalise(resumo: ResumoPayload): string {
  if (resumo.donut.length === 0) {
    return "Ainda não há transações confirmadas suficientes pra gerar uma análise. Categorize e confirme algumas transações no Extrato pra começar a ver insights aqui.";
  }

  const frases: string[] = [];
  const maiorCategoria = resumo.donut[0];

  frases.push(
    `${maiorCategoria.nome} concentra a maior parte do seu gasto, com ${maiorCategoria.percentual.toFixed(0)}% do total.`
  );

  if (resumo.diaComMaiorGastoGeral) {
    frases.push(`Você costuma gastar mais às ${resumo.diaComMaiorGastoGeral}.`);
  }

  if (resumo.barrasPorMes.length >= 2) {
    const atual = resumo.barrasPorMes[resumo.barrasPorMes.length - 1];
    const anterior = resumo.barrasPorMes[resumo.barrasPorMes.length - 2];
    if (anterior.valor > 0) {
      const variacao = ((atual.valor - anterior.valor) / anterior.valor) * 100;
      const direcao = variacao >= 0 ? "a mais" : "a menos";
      frases.push(
        `Você gastou ${Math.abs(variacao).toFixed(0)}% ${direcao} que no mês anterior.`
      );
    }
  }

  frases.push(
    `Considerando que ${maiorCategoria.nome} é sua maior categoria de gasto, pequenos ajustes aí tendem a ter mais impacto que em categorias menores.`
  );

  return frases.join(" ");
}
