import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";

// FK cascade no schema (extrato_transacoes.importacao_id) já remove as
// transações vinculadas junto — foreign_keys=ON está habilitado no client.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const importacao = db
    .select()
    .from(schema.extratoImportacoes)
    .where(eq(schema.extratoImportacoes.id, id))
    .get();
  if (!importacao) {
    return NextResponse.json({ erro: "Importação não encontrada" }, { status: 404 });
  }

  db.delete(schema.extratoImportacoes)
    .where(eq(schema.extratoImportacoes.id, id))
    .run();

  return NextResponse.json({ ok: true });
}
