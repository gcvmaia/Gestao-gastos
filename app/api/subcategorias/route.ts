import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  const categoriaId = request.nextUrl.searchParams.get("categoriaId");
  const query = db.select().from(schema.subcategorias);
  const subcategorias = categoriaId
    ? query.where(eq(schema.subcategorias.categoriaId, categoriaId)).all()
    : query.all();
  return NextResponse.json(subcategorias);
}

const criarSchema = z.object({
  categoriaId: z.string().trim().min(1),
  nome: z.string().trim().min(1),
  icone: z.string().trim().min(1),
});

export async function POST(request: Request) {
  const parsed = criarSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ erro: parsed.error.message }, { status: 400 });
  }

  const categoriaPai = db
    .select()
    .from(schema.categorias)
    .where(eq(schema.categorias.id, parsed.data.categoriaId))
    .get();
  if (!categoriaPai) {
    return NextResponse.json({ erro: "Categoria não encontrada" }, { status: 404 });
  }

  const subcategoria = {
    id: randomUUID(),
    categoriaId: parsed.data.categoriaId,
    nome: parsed.data.nome,
    icone: parsed.data.icone,
    protegida: false,
  };
  db.insert(schema.subcategorias).values(subcategoria).run();

  return NextResponse.json(subcategoria, { status: 201 });
}
