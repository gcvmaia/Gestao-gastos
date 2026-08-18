import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";

const editarSchema = z.object({
  nome: z.string().trim().min(1).optional(),
  cor: z.string().trim().min(1).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const categoria = db
    .select()
    .from(schema.categorias)
    .where(eq(schema.categorias.id, id))
    .get();
  if (!categoria) {
    return NextResponse.json({ erro: "Categoria não encontrada" }, { status: 404 });
  }
  if (categoria.protegida) {
    return NextResponse.json(
      { erro: "A categoria 'Outros' não pode ser editada" },
      { status: 400 }
    );
  }

  const parsed = editarSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ erro: parsed.error.message }, { status: 400 });
  }

  db.update(schema.categorias)
    .set(parsed.data)
    .where(eq(schema.categorias.id, id))
    .run();

  const atualizada = db
    .select()
    .from(schema.categorias)
    .where(eq(schema.categorias.id, id))
    .get();
  return NextResponse.json(atualizada);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const categoria = db
    .select()
    .from(schema.categorias)
    .where(eq(schema.categorias.id, id))
    .get();
  if (!categoria) {
    return NextResponse.json({ erro: "Categoria não encontrada" }, { status: 404 });
  }
  if (categoria.protegida) {
    return NextResponse.json(
      { erro: "A categoria 'Outros' não pode ser excluída" },
      { status: 400 }
    );
  }

  let transacoesAfetadas = 0;

  db.transaction((tx) => {
    const subIds = tx
      .select({ id: schema.subcategorias.id })
      .from(schema.subcategorias)
      .where(eq(schema.subcategorias.categoriaId, id))
      .all()
      .map((s) => s.id);

    const afetadas = tx
      .select({ id: schema.extratoTransacoes.id })
      .from(schema.extratoTransacoes)
      .where(eq(schema.extratoTransacoes.categoriaId, id))
      .all();
    transacoesAfetadas = afetadas.length;

    tx.update(schema.extratoTransacoes)
      .set({ categoriaId: null, subcategoriaId: null, status: "pendente" })
      .where(eq(schema.extratoTransacoes.categoriaId, id))
      .run();

    tx.update(schema.fornecedores)
      .set({ categoriaId: null, subcategoriaId: null })
      .where(eq(schema.fornecedores.categoriaId, id))
      .run();

    for (const subId of subIds) {
      tx.delete(schema.subcategorias)
        .where(eq(schema.subcategorias.id, subId))
        .run();
    }

    tx.delete(schema.categorias).where(eq(schema.categorias.id, id)).run();
  });

  return NextResponse.json({ transacoesAfetadas });
}
