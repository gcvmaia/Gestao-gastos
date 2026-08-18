import { db } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";

export function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type SugestaoFornecedor = {
  fornecedorId: string;
  categoriaId: string | null;
  subcategoriaId: string | null;
  origemSugestao: "exata" | "parcial";
} | null;

export type FornecedorParaMatching = {
  id: string;
  nome: string;
  categoriaId: string | null;
  subcategoriaId: string | null;
  variacoes: string[]; // já normalizadas
};

const TAMANHO_MINIMO_PARCIAL = 4;

/**
 * Correspondência em duas camadas (ver telas/interface-extrato.md,
 * "Reconhecimento de fornecedor em duas camadas"): exata contra
 * fornecedor_variacoes primeiro, depois parcial (trecho em comum) contra
 * nome/variações de fornecedores conhecidos. O algoritmo exato da parcial é
 * detalhe de implementação por spec — aqui: maior substring em comum vence.
 */
export function encontrarFornecedorParaTexto(
  descricaoBruta: string,
  catalogo: FornecedorParaMatching[]
): SugestaoFornecedor {
  const alvo = normalizarTexto(descricaoBruta);
  if (!alvo) return null;

  for (const fornecedor of catalogo) {
    if (fornecedor.variacoes.includes(alvo)) {
      return {
        fornecedorId: fornecedor.id,
        categoriaId: fornecedor.categoriaId,
        subcategoriaId: fornecedor.subcategoriaId,
        origemSugestao: "exata",
      };
    }
  }

  let melhor: { fornecedor: FornecedorParaMatching; tamanho: number } | null =
    null;
  for (const fornecedor of catalogo) {
    const candidatos = [
      normalizarTexto(fornecedor.nome),
      ...fornecedor.variacoes,
    ];
    for (const candidato of candidatos) {
      if (candidato.length < TAMANHO_MINIMO_PARCIAL) continue;
      if (alvo.includes(candidato) || candidato.includes(alvo)) {
        const tamanho = Math.min(candidato.length, alvo.length);
        if (!melhor || tamanho > melhor.tamanho) {
          melhor = { fornecedor, tamanho };
        }
      }
    }
  }

  if (!melhor) return null;
  return {
    fornecedorId: melhor.fornecedor.id,
    categoriaId: melhor.fornecedor.categoriaId,
    subcategoriaId: melhor.fornecedor.subcategoriaId,
    origemSugestao: "parcial",
  };
}

export function carregarCatalogoFornecedores(): FornecedorParaMatching[] {
  const fornecedores = db.select().from(schema.fornecedores).all();
  const variacoes = db.select().from(schema.fornecedorVariacoes).all();

  return fornecedores.map((f) => ({
    id: f.id,
    nome: f.nome,
    categoriaId: f.categoriaId,
    subcategoriaId: f.subcategoriaId,
    variacoes: variacoes
      .filter((v) => v.fornecedorId === f.id)
      .map((v) => normalizarTexto(v.textoBruto)),
  }));
}
