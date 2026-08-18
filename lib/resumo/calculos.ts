import { getDay } from "date-fns";
import type { Categoria, ExtratoTransacao, Subcategoria } from "@/lib/types";

const DIAS_SEMANA = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export type ResumoPayload = {
  transparencia: { naoConfirmadas: number };
  indicadores: {
    receitaTotal: number;
    saldoLiquido: number;
    mediaMensalGasto: number;
    totalGasto: number;
  };
  diaComMaiorGastoGeral: string | null;
  donut: {
    categoriaId: string;
    nome: string;
    cor: string;
    valor: number;
    percentual: number;
    subcategorias: {
      subcategoriaId: string;
      nome: string;
      icone: string;
      valor: number;
      percentual: number;
    }[];
  }[];
  barrasPorMes: { mes: string; valor: number }[];
  arvore: {
    categoriaId: string;
    nome: string;
    cor: string;
    percentualDoTotal: number;
    diaDePico: string | null;
    subcategorias: {
      subcategoriaId: string;
      nome: string;
      icone: string;
      percentualDoTotal: number;
      diaDePico: string | null;
    }[];
  }[];
};

/**
 * Ponto único de agregação do Resumo. Recebe só transações `confirmada` (o
 * chamador filtra antes) — regra crítica repetida em telas/interface-resumo.md:
 * "sugerida" e "pendente" nunca entram em nenhum cálculo dessa tela.
 */
export function calcularResumo(
  confirmadas: ExtratoTransacao[],
  naoConfirmadasNoPeriodo: number,
  categorias: Categoria[],
  subcategorias: Subcategoria[]
): ResumoPayload {
  const receitaTotal = somaOnde(confirmadas, (t) => t.valor > 0);
  const totalGasto = Math.abs(somaOnde(confirmadas, (t) => t.valor < 0));
  const saldoLiquido = receitaTotal - totalGasto;

  const meses = new Set(confirmadas.map((t) => t.data.slice(0, 7)));
  const mediaMensalGasto = meses.size > 0 ? totalGasto / meses.size : 0;

  const gastos = confirmadas.filter((t) => t.valor < 0);

  const donut = categorias
    .map((cat) => {
      const daCategoria = gastos.filter((t) => t.categoriaId === cat.id);
      const valorCategoria = Math.abs(somaOnde(daCategoria, () => true));
      const subsDaCategoria = subcategorias.filter(
        (s) => s.categoriaId === cat.id
      );

      return {
        categoriaId: cat.id,
        nome: cat.nome,
        cor: cat.cor,
        valor: valorCategoria,
        percentual: totalGasto > 0 ? (valorCategoria / totalGasto) * 100 : 0,
        subcategorias: subsDaCategoria
          .map((sub) => {
            const daSub = daCategoria.filter(
              (t) => t.subcategoriaId === sub.id
            );
            const valorSub = Math.abs(somaOnde(daSub, () => true));
            return {
              subcategoriaId: sub.id,
              nome: sub.nome,
              icone: sub.icone,
              valor: valorSub,
              percentual:
                valorCategoria > 0 ? (valorSub / valorCategoria) * 100 : 0,
            };
          })
          .filter((s) => s.valor > 0),
      };
    })
    .filter((c) => c.valor > 0)
    .sort((a, b) => b.valor - a.valor);

  const porMes = new Map<string, number>();
  for (const t of gastos) {
    const mes = t.data.slice(0, 7);
    porMes.set(mes, (porMes.get(mes) ?? 0) + Math.abs(t.valor));
  }
  const barrasPorMes = [...porMes.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, valor]) => ({ mes, valor }));

  const arvore = categorias
    .map((cat) => {
      const daCategoria = gastos.filter((t) => t.categoriaId === cat.id);
      if (daCategoria.length === 0) return null;
      const valorCategoria = Math.abs(somaOnde(daCategoria, () => true));
      const subsDaCategoria = subcategorias.filter(
        (s) => s.categoriaId === cat.id
      );

      return {
        categoriaId: cat.id,
        nome: cat.nome,
        cor: cat.cor,
        percentualDoTotal:
          totalGasto > 0 ? (valorCategoria / totalGasto) * 100 : 0,
        diaDePico: diaDePico(daCategoria),
        subcategorias: subsDaCategoria
          .map((sub) => {
            const daSub = daCategoria.filter(
              (t) => t.subcategoriaId === sub.id
            );
            if (daSub.length === 0) return null;
            return {
              subcategoriaId: sub.id,
              nome: sub.nome,
              icone: sub.icone,
              percentualDoTotal:
                totalGasto > 0
                  ? (Math.abs(somaOnde(daSub, () => true)) / totalGasto) * 100
                  : 0,
              diaDePico: diaDePico(daSub),
            };
          })
          .filter((s): s is NonNullable<typeof s> => s !== null),
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null)
    .sort((a, b) => b.percentualDoTotal - a.percentualDoTotal);

  return {
    transparencia: { naoConfirmadas: naoConfirmadasNoPeriodo },
    indicadores: { receitaTotal, saldoLiquido, mediaMensalGasto, totalGasto },
    diaComMaiorGastoGeral: diaDePico(gastos),
    donut,
    barrasPorMes,
    arvore,
  };
}

function somaOnde(
  transacoes: ExtratoTransacao[],
  filtro: (t: ExtratoTransacao) => boolean
): number {
  return transacoes.filter(filtro).reduce((acc, t) => acc + t.valor, 0);
}

function diaDePico(transacoes: ExtratoTransacao[]): string | null {
  if (transacoes.length === 0) return null;
  const somaPorDia = new Array(7).fill(0) as number[];
  for (const t of transacoes) {
    const dia = getDay(new Date(t.data));
    somaPorDia[dia] += Math.abs(t.valor);
  }
  const maiorIdx = somaPorDia.indexOf(Math.max(...somaPorDia));
  return DIAS_SEMANA[maiorIdx];
}
