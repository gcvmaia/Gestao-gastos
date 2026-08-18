import { NextResponse } from "next/server";
import { z } from "zod";
import { categorizarTransacoes } from "@/lib/fornecedores/aprendizado";

const bulkSchema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1),
  fornecedorId: z.string().trim().min(1),
  categoriaId: z.string().trim().min(1),
  subcategoriaId: z.string().trim().min(1),
});

export async function PATCH(request: Request) {
  const parsed = bulkSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ erro: parsed.error.message }, { status: 400 });
  }

  categorizarTransacoes({
    transacaoIds: parsed.data.ids,
    fornecedorId: parsed.data.fornecedorId,
    categoriaId: parsed.data.categoriaId,
    subcategoriaId: parsed.data.subcategoriaId,
  });

  return NextResponse.json({ ok: true });
}
