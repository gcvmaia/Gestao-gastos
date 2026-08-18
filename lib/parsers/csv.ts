import Papa from "papaparse";

export type PlanilhaBruta = {
  cabecalhos: string[];
  linhas: string[][];
};

export function parseCsv(conteudo: string): PlanilhaBruta {
  const resultado = Papa.parse<string[]>(conteudo, {
    skipEmptyLines: true,
  });

  const [cabecalhos, ...linhas] = resultado.data;
  return { cabecalhos: cabecalhos ?? [], linhas };
}
