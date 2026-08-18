import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  db.delete(schema.fornecedorVariacoes)
    .where(eq(schema.fornecedorVariacoes.id, id))
    .run();
  return NextResponse.json({ ok: true });
}
