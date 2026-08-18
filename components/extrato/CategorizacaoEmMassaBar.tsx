"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { resolverFornecedorId } from "@/lib/client/categorizar";
import type { Fornecedor } from "@/lib/types";
import {
  CATEGORIZACAO_VAZIA,
  SeletorCategorizacao,
  type ValorCategorizacao,
} from "./SeletorCategorizacao";

export function CategorizacaoEmMassaBar({
  quantidadeSelecionada,
  ids,
  fornecedores,
  onAplicado,
  onCancelar,
}: {
  quantidadeSelecionada: number;
  ids: string[];
  fornecedores: Fornecedor[];
  onAplicado: () => void;
  onCancelar: () => void;
}) {
  const [valor, setValor] = useState<ValorCategorizacao>(CATEGORIZACAO_VAZIA);
  const [aplicando, setAplicando] = useState(false);

  const podeAplicar = Boolean(
    valor.fornecedorNome.trim() && valor.categoriaId && valor.subcategoriaId
  );

  async function aplicar() {
    setAplicando(true);
    try {
      const fornecedorId = await resolverFornecedorId(valor);
      if (!fornecedorId) {
        toast.error("Não foi possível resolver o fornecedor.");
        return;
      }

      const res = await fetch("/api/transacoes/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids,
          fornecedorId,
          categoriaId: valor.categoriaId,
          subcategoriaId: valor.subcategoriaId,
        }),
      });
      if (!res.ok) throw new Error();

      toast.success(`${ids.length} transação(ões) categorizada(s).`);
      setValor(CATEGORIZACAO_VAZIA);
      onAplicado();
    } catch {
      toast.error("Erro ao aplicar categorização.");
    } finally {
      setAplicando(false);
    }
  }

  return (
    <div className="sticky bottom-4 z-10 rounded-xl border border-border-strong bg-surface-2 p-4 shadow-lg">
      <div className="mb-2 text-sm font-medium">
        {quantidadeSelecionada} selecionada(s)
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <SeletorCategorizacao
            valor={valor}
            onChange={setValor}
            fornecedores={fornecedores}
            idPrefixo="bulk"
          />
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancelar}
            disabled={aplicando}
          >
            Cancelar seleção
          </Button>
          <Button size="sm" onClick={aplicar} disabled={!podeAplicar || aplicando}>
            Aplicar
          </Button>
        </div>
      </div>
    </div>
  );
}
