import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";

export async function GET() {
  const categorias = db.select().from(schema.categorias).all();
  return NextResponse.json(categorias);
}

const criarSchema = z.object({
  nome: z.string().trim().min(1),
  cor: z.string().trim().min(1),
});

export async function POST(request: Request) {
  const parsed = criarSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ erro: parsed.error.message }, { status: 400 });
  }

  const categoria = {
    id: randomUUID(),
    nome: parsed.data.nome,
    cor: parsed.data.cor,
    protegida: false,
  };
  db.insert(schema.categorias).values(categoria).run();

  return NextResponse.json(categoria, { status: 201 });
}
