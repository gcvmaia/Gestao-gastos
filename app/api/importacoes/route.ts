import { randomUUID } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";

export async function GET() {
  const importacoes = db
    .select()
    .from(schema.extratoImportacoes)
    .orderBy(desc(schema.extratoImportacoes.dataImportacao))
    .all();
  return NextResponse.json(importacoes);
}

const transacaoSchema = z.object({
  data: z.string().min(1),
  descricaoBruta: z.string().min(1),
  valor: z.number(),
  moedaOriginal: z.string().nullable(),
  valorOriginal: z.number().nullable(),
  cotacaoUsada: z.number().nullable(),
  possivelDuplicado: z.boolean(),
  fornecedorId: z.string().nullable(),
  categoriaId: z.string().nullable(),
  subcategoriaId: z.string().nullable(),
  status: z.enum(["pendente", "sugerida"]),
  origemSugestao: z.enum(["exata", "parcial"]).nullable(),
});

const confirmarSchema = z.object({
  nomeArquivo: z.string().min(1),
  identificadorArquivo: z.string().min(1),
  transacoes: z.array(transacaoSchema).min(1),
});

// Grava a importação confirmada (payload já ajustado pelo usuário no
// preview — cotações editadas) em uma única transação SQL.
export async function POST(request: Request) {
  const parsed = confirmarSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ erro: parsed.error.message }, { status: 400 });
  }

  const importacaoId = randomUUID();

  db.transaction((tx) => {
    tx.insert(schema.extratoImportacoes)
      .values({
        id: importacaoId,
        nomeArquivo: parsed.data.nomeArquivo,
        identificadorArquivo: parsed.data.identificadorArquivo,
        quantidadeTransacoes: parsed.data.transacoes.length,
      })
      .run();

    for (const t of parsed.data.transacoes) {
      tx.insert(schema.extratoTransacoes)
        .values({ id: randomUUID(), importacaoId, ...t })
        .run();
    }
  });

  const importacao = db
    .select()
    .from(schema.extratoImportacoes)
    .where(eq(schema.extratoImportacoes.id, importacaoId))
    .get();
  return NextResponse.json(importacao, { status: 201 });
}
