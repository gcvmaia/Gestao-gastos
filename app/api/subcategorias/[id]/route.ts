import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";

const editarSchema = z.object({
  nome: z.string().trim().min(1).optional(),
  icone: z.string().trim().min(1).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const subcategoria = db
    .select()
    .from(schema.subcategorias)
    .where(eq(schema.subcategorias.id, id))
    .get();
  if (!subcategoria) {
    return NextResponse.json({ erro: "Subcategoria não encontrada" }, { status: 404 });
  }
  if (subcategoria.protegida) {
    return NextResponse.json(
      { erro: "A subcategoria 'Outro' não pode ser editada" },
      { status: 400 }
    );
  }

  const parsed = editarSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ erro: parsed.error.message }, { status: 400 });
  }

  db.update(schema.subcategorias)
    .set(parsed.data)
    .where(eq(schema.subcategorias.id, id))
    .run();

  const atualizada = db
    .select()
    .from(schema.subcategorias)
    .where(eq(schema.subcategorias.id, id))
    .get();
  return NextResponse.json(atualizada);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const subcategoria = db
    .select()
    .from(schema.subcategorias)
    .where(eq(schema.subcategorias.id, id))
    .get();
  if (!subcategoria) {
    return NextResponse.json({ erro: "Subcategoria não encontrada" }, { status: 404 });
  }
  if (subcategoria.protegida) {
    return NextResponse.json(
      { erro: "A subcategoria 'Outro' não pode ser excluída" },
      { status: 400 }
    );
  }

  let transacoesAfetadas = 0;

  db.transaction((tx) => {
    const afetadas = tx
      .select({ id: schema.extratoTransacoes.id })
      .from(schema.extratoTransacoes)
      .where(eq(schema.extratoTransacoes.subcategoriaId, id))
      .all();
    transacoesAfetadas = afetadas.length;

    tx.update(schema.extratoTransacoes)
      .set({ categoriaId: null, subcategoriaId: null, status: "pendente" })
      .where(eq(schema.extratoTransacoes.subcategoriaId, id))
      .run();

    tx.update(schema.fornecedores)
      .set({ subcategoriaId: null })
      .where(eq(schema.fornecedores.subcategoriaId, id))
      .run();

    tx.delete(schema.subcategorias)
      .where(eq(schema.subcategorias.id, id))
      .run();
  });

  return NextResponse.json({ transacoesAfetadas });
}
