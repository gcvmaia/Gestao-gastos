import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  const fornecedores = q
    ? db
        .select()
        .from(schema.fornecedores)
        .where(
          sql`lower(${schema.fornecedores.nome}) like ${`%${q.toLowerCase()}%`}`
        )
        .all()
    : db.select().from(schema.fornecedores).all();

  const variacoes = db.select().from(schema.fornecedorVariacoes).all();
  const contagens = db
    .select({
      fornecedorId: schema.extratoTransacoes.fornecedorId,
      total: sql<number>`count(*)`,
    })
    .from(schema.extratoTransacoes)
    .groupBy(schema.extratoTransacoes.fornecedorId)
    .all();

  const resultado = fornecedores.map((f) => ({
    ...f,
    variacoes: variacoes.filter((v) => v.fornecedorId === f.id),
    transacoesVinculadas:
      contagens.find((c) => c.fornecedorId === f.id)?.total ?? 0,
  }));

  return NextResponse.json(resultado);
}

const criarSchema = z.object({
  nome: z.string().trim().min(1),
  categoriaId: z.string().trim().min(1).nullable().optional(),
  subcategoriaId: z.string().trim().min(1).nullable().optional(),
  variacoes: z.array(z.string().trim().min(1)).optional(),
});

export async function POST(request: Request) {
  const parsed = criarSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ erro: parsed.error.message }, { status: 400 });
  }

  const fornecedor = {
    id: randomUUID(),
    nome: parsed.data.nome,
    categoriaId: parsed.data.categoriaId ?? null,
    subcategoriaId: parsed.data.subcategoriaId ?? null,
  };

  db.transaction((tx) => {
    tx.insert(schema.fornecedores).values(fornecedor).run();
    for (const textoBruto of parsed.data.variacoes ?? []) {
      tx.insert(schema.fornecedorVariacoes)
        .values({ id: randomUUID(), fornecedorId: fornecedor.id, textoBruto })
        .run();
    }
  });

  return NextResponse.json(fornecedor, { status: 201 });
}
