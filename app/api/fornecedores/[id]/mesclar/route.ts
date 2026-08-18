import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";

const mesclarSchema = z.object({
  secundarioId: z.string().trim().min(1),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: principalId } = await params;
  const parsed = mesclarSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ erro: parsed.error.message }, { status: 400 });
  }
  const { secundarioId } = parsed.data;

  if (secundarioId === principalId) {
    return NextResponse.json(
      { erro: "Não é possível mesclar um fornecedor com ele mesmo" },
      { status: 400 }
    );
  }

  const [principal, secundario] = [
    db.select().from(schema.fornecedores).where(eq(schema.fornecedores.id, principalId)).get(),
    db.select().from(schema.fornecedores).where(eq(schema.fornecedores.id, secundarioId)).get(),
  ];
  if (!principal || !secundario) {
    return NextResponse.json({ erro: "Fornecedor não encontrado" }, { status: 404 });
  }

  db.transaction((tx) => {
    tx.update(schema.fornecedorVariacoes)
      .set({ fornecedorId: principalId })
      .where(eq(schema.fornecedorVariacoes.fornecedorId, secundarioId))
      .run();

    tx.update(schema.extratoTransacoes)
      .set({ fornecedorId: principalId })
      .where(eq(schema.extratoTransacoes.fornecedorId, secundarioId))
      .run();

    tx.delete(schema.fornecedores)
      .where(eq(schema.fornecedores.id, secundarioId))
      .run();
  });

  return NextResponse.json({ ok: true });
}
