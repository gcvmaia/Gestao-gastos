import ExcelJS from "exceljs";
import type { PlanilhaBruta } from "./csv";

function celulaParaTexto(valor: ExcelJS.CellValue): string {
  if (valor === null || valor === undefined) return "";
  if (valor instanceof Date) return valor.toISOString();
  if (typeof valor === "object") {
    if ("result" in valor) return String(valor.result ?? "");
    if ("text" in valor) return String(valor.text ?? "");
    if ("richText" in valor) {
      return valor.richText.map((r) => r.text).join("");
    }
    return "";
  }
  return String(valor);
}

export async function parseExcel(
  conteudo: ArrayBuffer
): Promise<PlanilhaBruta> {
  const workbook = new ExcelJS.Workbook();
  // exceljs declara `load` contra uma versão de `Buffer` incompatível com o
  // genérico `Buffer<ArrayBufferLike>` do @types/node atual — mesmo valor em
  // runtime, então contorna via `any` só nessa chamada.
  const carregar = workbook.xlsx.load as (buffer: unknown) => Promise<unknown>;
  await carregar(Buffer.from(conteudo));

  const sheet = workbook.worksheets[0];
  if (!sheet) return { cabecalhos: [], linhas: [] };

  const linhas: string[][] = [];
  sheet.eachRow((row) => {
    const valores = (row.values as ExcelJS.CellValue[]).slice(1);
    linhas.push(valores.map(celulaParaTexto));
  });

  const [cabecalhos, ...resto] = linhas;
  return { cabecalhos: cabecalhos ?? [], linhas: resto };
}
