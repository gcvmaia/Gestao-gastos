"use client";

import { CategoriaBadge } from "@/components/shared/CategoriaBadge";
import { useCategorias } from "@/components/shared/CategoriasProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FornecedorComVariacoes } from "@/lib/types";

export function TabelaFornecedores({
  fornecedores,
  busca,
  onBuscaChange,
  onNovo,
  onEditar,
  onMesclar,
  onExcluir,
}: {
  fornecedores: FornecedorComVariacoes[];
  busca: string;
  onBuscaChange: (busca: string) => void;
  onNovo: () => void;
  onEditar: (fornecedor: FornecedorComVariacoes) => void;
  onMesclar: (fornecedor: FornecedorComVariacoes) => void;
  onExcluir: (fornecedor: FornecedorComVariacoes) => void;
}) {
  const { categorias, subcategorias } = useCategorias();

  return (
    <div className="mt-8">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Fornecedores</h2>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Buscar fornecedor..."
            value={busca}
            onChange={(e) => onBuscaChange(e.target.value)}
            className="h-8 w-56 text-xs"
          />
          <Button size="sm" className="h-8 gap-1" onClick={onNovo}>
            + Novo fornecedor
          </Button>
        </div>
      </div>

      {fornecedores.length === 0 ? (
        <div className="rounded-xl border border-border-strong bg-surface-2 py-10 text-center text-sm text-muted-foreground">
          {busca
            ? "Nenhum fornecedor encontrado"
            : "Nenhum fornecedor ainda — crie um aqui ou categorize uma transação no Extrato."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border-strong bg-surface-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-strong text-left text-xs text-muted-foreground">
                <th className="px-3 py-2 font-medium">Nome</th>
                <th className="px-3 py-2 font-medium">Categoria</th>
                <th className="px-3 py-2 font-medium">Transações</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {fornecedores.map((f) => {
                const categoria = categorias.find((c) => c.id === f.categoriaId) ?? null;
                const subcategoria =
                  subcategorias.find((s) => s.id === f.subcategoriaId) ?? null;
                return (
                  <tr key={f.id} className="border-b border-border-strong last:border-0">
                    <td className="px-3 py-2">{f.nome}</td>
                    <td className="px-3 py-2">
                      <CategoriaBadge categoria={categoria} subcategoria={subcategoria} />
                    </td>
                    <td className="px-3 py-2">{f.transacoesVinculadas}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => onEditar(f)}>
                          Editar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onMesclar(f)}>
                          Mesclar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onExcluir(f)}>
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
