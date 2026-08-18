import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";
import type { StatusTransacao } from "@/lib/db/schema";
import type { TransacaoExpandida } from "@/lib/types";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const periodoDe = params.get("periodoDe");
  const periodoAte = params.get("periodoAte");
  const fornecedorTexto = params.get("fornecedor")?.trim();
  const valorMin = params.get("valorMin");
  const valorMax = params.get("valorMax");
  const statusParam = params.get("status");
  const categoriaIdsParam = params.get("categoriaIds");
  const subcategoriaIdsParam = params.get("subcategoriaIds");
  const importacaoId = params.get("importacaoId");

  const condicoes = [];
  if (periodoDe) condicoes.push(gte(schema.extratoTransacoes.data, periodoDe));
  if (periodoAte) condicoes.push(lte(schema.extratoTransacoes.data, periodoAte));
  if (importacaoId)
    condicoes.push(eq(schema.extratoTransacoes.importacaoId, importacaoId));
  if (statusParam) {
    condicoes.push(
      inArray(
        schema.extratoTransacoes.status,
        statusParam.split(",") as StatusTransacao[]
      )
    );
  }
  if (categoriaIdsParam) {
    condicoes.push(
      inArray(schema.extratoTransacoes.categoriaId, categoriaIdsParam.split(","))
    );
  }
  if (subcategoriaIdsParam) {
    condicoes.push(
      inArray(
        schema.extratoTransacoes.subcategoriaId,
        subcategoriaIdsParam.split(",")
      )
    );
  }
  if (valorMin) {
    condicoes.push(
      gte(sql`abs(${schema.extratoTransacoes.valor})`, Number(valorMin))
    );
  }
  if (valorMax) {
    condicoes.push(
      lte(sql`abs(${schema.extratoTransacoes.valor})`, Number(valorMax))
    );
  }

  const linhas = db
    .select({
      transacao: schema.extratoTransacoes,
      fornecedor: schema.fornecedores,
      categoria: schema.categorias,
      subcategoria: schema.subcategorias,
    })
    .from(schema.extratoTransacoes)
    .leftJoin(
      schema.fornecedores,
      eq(schema.extratoTransacoes.fornecedorId, schema.fornecedores.id)
    )
    .leftJoin(
      schema.categorias,
      eq(schema.extratoTransacoes.categoriaId, schema.categorias.id)
    )
    .leftJoin(
      schema.subcategorias,
      eq(schema.extratoTransacoes.subcategoriaId, schema.subcategorias.id)
    )
    .where(condicoes.length > 0 ? and(...condicoes) : undefined)
    .orderBy(desc(schema.extratoTransacoes.data))
    .all();

  let resultado: TransacaoExpandida[] = linhas.map((l) => ({
    ...l.transacao,
    fornecedor: l.fornecedor
      ? { id: l.fornecedor.id, nome: l.fornecedor.nome }
      : null,
    categoria: l.categoria
      ? { id: l.categoria.id, nome: l.categoria.nome, cor: l.categoria.cor }
      : null,
    subcategoria: l.subcategoria
      ? {
          id: l.subcategoria.id,
          nome: l.subcategoria.nome,
          icone: l.subcategoria.icone,
        }
      : null,
  }));

  if (fornecedorTexto) {
    const alvo = fornecedorTexto.toLowerCase();
    resultado = resultado.filter(
      (t) =>
        t.descricaoBruta.toLowerCase().includes(alvo) ||
        (t.fornecedor?.nome.toLowerCase().includes(alvo) ?? false)
    );
  }

  return NextResponse.json(resultado);
}
