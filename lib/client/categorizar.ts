import type { ValorCategorizacao } from "@/components/extrato/SeletorCategorizacao";
import type { Fornecedor } from "@/lib/types";

/** Resolve o fornecedor selecionado/digitado pra um id — cria um novo se o nome ainda não existir no catálogo. */
export async function resolverFornecedorId(
  valor: ValorCategorizacao
): Promise<string | null> {
  if (valor.fornecedorIdExistente) return valor.fornecedorIdExistente;
  if (!valor.fornecedorNome.trim()) return null;

  const res = await fetch("/api/fornecedores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: valor.fornecedorNome.trim(),
      categoriaId: valor.categoriaId || null,
      subcategoriaId: valor.subcategoriaId || null,
    }),
  });
  if (!res.ok) return null;

  const criado: Fornecedor = await res.json();
  return criado.id;
}
