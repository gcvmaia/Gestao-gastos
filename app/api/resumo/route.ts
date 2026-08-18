import { and, gte, lte } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";
import { gerarTextoAnalise } from "@/lib/resumo/analise";
import { calcularResumo } from "@/lib/resumo/calculos";

// Endpoint agregado único do Resumo — mantém a regra crítica "só
// status = confirmada entra em qualquer cálculo" centralizada num único
// lugar (ver telas/interface-resumo.md), em vez de replicada por componente.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const periodoDe = params.get("periodoDe");
  const periodoAte = params.get("periodoAte");

  const condicoesPeriodo = [];
  if (periodoDe) condicoesPeriodo.push(gte(schema.extratoTransacoes.data, periodoDe));
  if (periodoAte) condicoesPeriodo.push(lte(schema.extratoTransacoes.data, periodoAte));

  const todasNoPeriodo = db
    .select()
    .from(schema.extratoTransacoes)
    .where(condicoesPeriodo.length > 0 ? and(...condicoesPeriodo) : undefined)
    .all();

  const confirmadas = todasNoPeriodo.filter((t) => t.status === "confirmada");
  const naoConfirmadas = todasNoPeriodo.length - confirmadas.length;

  const categorias = db.select().from(schema.categorias).all();
  const subcategorias = db.select().from(schema.subcategorias).all();

  const resumo = calcularResumo(
    confirmadas,
    naoConfirmadas,
    categorias,
    subcategorias
  );
  const textoAnalise = gerarTextoAnalise(resumo);

  return NextResponse.json({ ...resumo, textoAnalise });
}
