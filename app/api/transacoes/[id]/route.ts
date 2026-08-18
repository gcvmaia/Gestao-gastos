import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";
import { categorizarTransacoes } from "@/lib/fornecedores/aprendizado";

const edicaoSchema = z.object({
  fornecedorId: z.string().trim().min(1),
  categoriaId: z.string().trim().min(1),
  subcategoriaId: z.string().trim().min(1),
});

const toggleSchema = z.object({
  status: z.enum(["sugerida", "confirmada"]),
});

// Dois usos no mesmo endpoint (ver telas/interface-extrato.md): edição
// completa (fornecedor/categoria/subcategoria) ou toggle da flag de
// sugestão, distinguidos pelo formato do body.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const transacao = db
    .select()
    .from(schema.extratoTransacoes)
    .where(eq(schema.extratoTransacoes.id, id))
    .get();
  if (!transacao) {
    return NextResponse.json({ erro: "Transação não encontrada" }, { status: 404 });
  }

  if (body && typeof body === "object" && "fornecedorId" in body) {
    const parsed = edicaoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ erro: parsed.error.message }, { status: 400 });
    }
    categorizarTransacoes({
      transacaoIds: [id],
      fornecedorId: parsed.data.fornecedorId,
      categoriaId: parsed.data.categoriaId,
      subcategoriaId: parsed.data.subcategoriaId,
    });
  } else {
    const parsed = toggleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ erro: parsed.error.message }, { status: 400 });
    }
    db.update(schema.extratoTransacoes)
      .set({ status: parsed.data.status })
      .where(eq(schema.extratoTransacoes.id, id))
      .run();
  }

  const atualizada = db
    .select()
    .from(schema.extratoTransacoes)
    .where(eq(schema.extratoTransacoes.id, id))
    .get();
  return NextResponse.json(atualizada);
}
