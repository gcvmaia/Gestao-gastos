import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";
import { encontrarFornecedorParaTexto, normalizarTexto } from "./matching";

type CategorizacaoAplicada = {
  transacaoIds: string[];
  fornecedorId: string;
  categoriaId: string;
  subcategoriaId: string;
};

/**
 * Aplica fornecedor/categoria/subcategoria a um conjunto de transações
 * (bulk ou individual — mesma lógica pros dois, ver telas/interface-extrato.md).
 * Registra variação de texto inédita, atualiza a categoria "padrão" do
 * fornecedor, marca as transações como confirmadas, e propaga sugestão pra
 * outras transações pendentes/sugeridas compatíveis.
 */
export function categorizarTransacoes({
  transacaoIds,
  fornecedorId,
  categoriaId,
  subcategoriaId,
}: CategorizacaoAplicada) {
  db.transaction((tx) => {
    const transacoes = tx
      .select()
      .from(schema.extratoTransacoes)
      .where(inArray(schema.extratoTransacoes.id, transacaoIds))
      .all();

    const variacoesExistentes = tx
      .select()
      .from(schema.fornecedorVariacoes)
      .where(eq(schema.fornecedorVariacoes.fornecedorId, fornecedorId))
      .all();
    const normalizadasExistentes = new Set(
      variacoesExistentes.map((v) => normalizarTexto(v.textoBruto))
    );

    for (const transacao of transacoes) {
      const normalizada = normalizarTexto(transacao.descricaoBruta);
      if (normalizada && !normalizadasExistentes.has(normalizada)) {
        tx.insert(schema.fornecedorVariacoes)
          .values({
            id: randomUUID(),
            fornecedorId,
            textoBruto: transacao.descricaoBruta,
          })
          .run();
        normalizadasExistentes.add(normalizada);
      }

      tx.update(schema.extratoTransacoes)
        .set({
          fornecedorId,
          categoriaId,
          subcategoriaId,
          status: "confirmada",
          origemSugestao: null,
        })
        .where(eq(schema.extratoTransacoes.id, transacao.id))
        .run();
    }

    tx.update(schema.fornecedores)
      .set({ categoriaId, subcategoriaId })
      .where(eq(schema.fornecedores.id, fornecedorId))
      .run();
  });

  propagarSugestoes(fornecedorId, transacaoIds);
}

/**
 * Propaga a sugestão pra outras transações pendentes/sugeridas (fora das
 * recém-categorizadas) cujo texto bruto combine com o fornecedor recém
 * atualizado — "aprendizado é imediato, inclusive dentro do mesmo import".
 * Nunca toca transações já confirmadas.
 */
export function propagarSugestoes(
  fornecedorId: string,
  excluirIds: string[] = []
) {
  const fornecedor = db
    .select()
    .from(schema.fornecedores)
    .where(eq(schema.fornecedores.id, fornecedorId))
    .get();
  if (!fornecedor) return;

  const variacoes = db
    .select()
    .from(schema.fornecedorVariacoes)
    .where(eq(schema.fornecedorVariacoes.fornecedorId, fornecedorId))
    .all();

  const catalogo = [
    {
      id: fornecedor.id,
      nome: fornecedor.nome,
      categoriaId: fornecedor.categoriaId,
      subcategoriaId: fornecedor.subcategoriaId,
      variacoes: variacoes.map((v) => normalizarTexto(v.textoBruto)),
    },
  ];

  const candidatas = db
    .select()
    .from(schema.extratoTransacoes)
    .where(inArray(schema.extratoTransacoes.status, ["pendente", "sugerida"]))
    .all()
    .filter((t) => !excluirIds.includes(t.id));

  for (const transacao of candidatas) {
    const sugestao = encontrarFornecedorParaTexto(
      transacao.descricaoBruta,
      catalogo
    );
    if (!sugestao) continue;

    db.update(schema.extratoTransacoes)
      .set({
        fornecedorId: sugestao.fornecedorId,
        categoriaId: sugestao.categoriaId,
        subcategoriaId: sugestao.subcategoriaId,
        status: "sugerida",
        origemSugestao: sugestao.origemSugestao,
      })
      .where(eq(schema.extratoTransacoes.id, transacao.id))
      .run();
  }
}
