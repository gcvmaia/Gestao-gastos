import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";
import { buscarCotacao } from "@/lib/cambio";
import {
  carregarCatalogoFornecedores,
  encontrarFornecedorParaTexto,
} from "@/lib/fornecedores/matching";
import { hashArrayBuffer } from "@/lib/hash";
import { detectarMapeamento, type MapeamentoColunas } from "@/lib/parsers/colunas";
import { converterLinhas } from "@/lib/parsers/converter";
import { parseCsv } from "@/lib/parsers/csv";
import { parseExcel } from "@/lib/parsers/excel";
import type { PreviewImportacao, TransacaoProposta } from "@/lib/types";

const mapeamentoManualSchema = z.object({
  data: z.number(),
  descricao: z.number(),
  valor: z.number().nullable(),
  credito: z.number().nullable(),
  debito: z.number().nullable(),
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File)) {
    return NextResponse.json({ erro: "Nenhum arquivo enviado" }, { status: 400 });
  }

  let mapeamentoManual: MapeamentoColunas | null = null;
  const mapeamentoRaw = formData.get("mapeamento");
  if (typeof mapeamentoRaw === "string" && mapeamentoRaw.length > 0) {
    try {
      const parsedManual = mapeamentoManualSchema.safeParse(
        JSON.parse(mapeamentoRaw)
      );
      if (parsedManual.success) mapeamentoManual = parsedManual.data;
    } catch {
      // ignora mapeamento inválido — cai de volta pra detecção automática
    }
  }

  const buffer = await arquivo.arrayBuffer();
  const identificadorArquivo = hashArrayBuffer(buffer);
  const nomeArquivo = arquivo.name;
  const extensao = nomeArquivo.split(".").pop()?.toLowerCase();

  let planilha: { cabecalhos: string[]; linhas: string[][] };
  try {
    if (extensao === "csv") {
      planilha = parseCsv(new TextDecoder("utf-8").decode(buffer));
    } else if (extensao === "xlsx" || extensao === "xls") {
      planilha = await parseExcel(buffer);
    } else {
      return NextResponse.json(
        { erro: "Formato de arquivo não reconhecido. Use CSV ou XLS/XLSX." },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { erro: "Não foi possível ler o arquivo. Ele pode estar corrompido." },
      { status: 400 }
    );
  }

  if (planilha.cabecalhos.length === 0) {
    return NextResponse.json(
      { erro: "Arquivo vazio ou sem cabeçalho." },
      { status: 400 }
    );
  }

  const mapeamento = mapeamentoManual ?? detectarMapeamento(planilha.cabecalhos);
  if (!mapeamento) {
    const resposta: PreviewImportacao = {
      nomeArquivo,
      identificadorArquivo,
      arquivoJaImportado: null,
      transacoesPropostas: [],
      moedasDetectadas: [],
      mapeamentoNecessario: {
        cabecalhos: planilha.cabecalhos,
        linhasAmostra: planilha.linhas.slice(0, 5),
      },
      erro: null,
    };
    return NextResponse.json(resposta);
  }

  const linhasConvertidas = converterLinhas(planilha.linhas, mapeamento);

  const moedasUnicas = [
    ...new Set(
      linhasConvertidas
        .map((l) => l.moedaOriginal)
        .filter((m): m is string => m !== null)
    ),
  ];
  const cotacoes = new Map<string, number | null>();
  for (const moeda of moedasUnicas) {
    cotacoes.set(moeda, await buscarCotacao(moeda));
  }

  const importacaoExistente = db
    .select()
    .from(schema.extratoImportacoes)
    .where(
      eq(schema.extratoImportacoes.identificadorArquivo, identificadorArquivo)
    )
    .get();

  const catalogo = carregarCatalogoFornecedores();
  const transacoesExistentes = db.select().from(schema.extratoTransacoes).all();

  const transacoesPropostas: TransacaoProposta[] = linhasConvertidas.map(
    (linha) => {
      const cotacao = linha.moedaOriginal
        ? cotacoes.get(linha.moedaOriginal) ?? null
        : null;
      const valorBRL = linha.moedaOriginal
        ? cotacao !== null
          ? linha.valor * cotacao
          : null
        : linha.valor;

      const sugestao = encontrarFornecedorParaTexto(
        linha.descricaoBruta,
        catalogo
      );

      const possivelDuplicado =
        sugestao !== null &&
        valorBRL !== null &&
        transacoesExistentes.some(
          (t) =>
            t.data === linha.data &&
            t.fornecedorId === sugestao.fornecedorId &&
            Math.abs(t.valor - valorBRL) < 0.01
        );

      return {
        data: linha.data,
        descricaoBruta: linha.descricaoBruta,
        valor: valorBRL,
        moedaOriginal: linha.moedaOriginal,
        valorOriginal: linha.moedaOriginal ? linha.valor : null,
        possivelDuplicado,
        fornecedorId: sugestao?.fornecedorId ?? null,
        categoriaId: sugestao?.categoriaId ?? null,
        subcategoriaId: sugestao?.subcategoriaId ?? null,
        status: sugestao ? "sugerida" : "pendente",
        origemSugestao: sugestao?.origemSugestao ?? null,
      };
    }
  );

  const resposta: PreviewImportacao = {
    nomeArquivo,
    identificadorArquivo,
    arquivoJaImportado: importacaoExistente
      ? { data: importacaoExistente.dataImportacao }
      : null,
    transacoesPropostas,
    moedasDetectadas: moedasUnicas.map((moeda) => ({
      moeda,
      cotacaoSugerida: cotacoes.get(moeda) ?? null,
    })),
    mapeamentoNecessario: null,
    erro: null,
  };

  return NextResponse.json(resposta);
}
