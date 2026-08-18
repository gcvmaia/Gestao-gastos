import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";

const editarSchema = z.object({
  nome: z.string().trim().min(1).optional(),
  categoriaId: z.string().trim().min(1).nullable().optional(),
  subcategoriaId: z.string().trim().min(1).nullable().optional(),
  variacoesAdicionar: z.array(z.string().trim().min(1)).optional(),
  atualizarConfirmadas: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const fornecedor = db
    .select()
    .from(schema.fornecedores)
    .where(eq(schema.fornecedores.id, id))
    .get();
  if (!fornecedor) {
    return NextResponse.json({ erro: "Fornecedor não encontrado" }, { status: 404 });
  }

  const parsed = editarSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ erro: parsed.error.message }, { status: 400 });
  }

  const { variacoesAdicionar, atualizarConfirmadas, ...camposFornecedor } =
    parsed.data;

  db.transaction((tx) => {
    if (Object.keys(camposFornecedor).length > 0) {
      tx.update(schema.fornecedores)
        .set(camposFornecedor)
        .where(eq(schema.fornecedores.id, id))
        .run();
    }

    for (const textoBruto of variacoesAdicionar ?? []) {
      tx.insert(schema.fornecedorVariacoes)
        .values({ id: randomUUID(), fornecedorId: id, textoBruto })
        .run();
    }

    const categoriaId = camposFornecedor.categoriaId ?? fornecedor.categoriaId;
    const subcategoriaId =
      camposFornecedor.subcategoriaId ?? fornecedor.subcategoriaId;

    if (atualizarConfirmadas && categoriaId && subcategoriaId) {
      tx.update(schema.extratoTransacoes)
        .set({ categoriaId, subcategoriaId })
        .where(
          and(
            eq(schema.extratoTransacoes.fornecedorId, id),
            eq(schema.extratoTransacoes.status, "confirmada")
          )
        )
        .run();
    }
  });

  const atualizado = db
    .select()
    .from(schema.fornecedores)
    .where(eq(schema.fornecedores.id, id))
    .get();
  return NextResponse.json(atualizado);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const fornecedor = db
    .select()
    .from(schema.fornecedores)
    .where(eq(schema.fornecedores.id, id))
    .get();
  if (!fornecedor) {
    return NextResponse.json({ erro: "Fornecedor não encontrado" }, { status: 404 });
  }

  db.transaction((tx) => {
    tx.update(schema.extratoTransacoes)
      .set({ fornecedorId: null })
      .where(eq(schema.extratoTransacoes.fornecedorId, id))
      .run();

    tx.delete(schema.fornecedores).where(eq(schema.fornecedores.id, id)).run();
  });

  return NextResponse.json({ ok: true });
}
