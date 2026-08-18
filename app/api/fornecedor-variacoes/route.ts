import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  const fornecedorId = request.nextUrl.searchParams.get("fornecedorId");
  const query = db.select().from(schema.fornecedorVariacoes);
  const variacoes = fornecedorId
    ? query.where(eq(schema.fornecedorVariacoes.fornecedorId, fornecedorId)).all()
    : query.all();
  return NextResponse.json(variacoes);
}

const criarSchema = z.object({
  fornecedorId: z.string().trim().min(1),
  textoBruto: z.string().trim().min(1),
});

export async function POST(request: Request) {
  const parsed = criarSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ erro: parsed.error.message }, { status: 400 });
  }

  const variacao = { id: randomUUID(), ...parsed.data };
  db.insert(schema.fornecedorVariacoes).values(variacao).run();

  return NextResponse.json(variacao, { status: 201 });
}
