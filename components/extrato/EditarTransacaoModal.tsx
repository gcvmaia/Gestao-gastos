"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ModalShell } from "@/components/shared/ModalShell";
import { Button } from "@/components/ui/button";
import { resolverFornecedorId } from "@/lib/client/categorizar";
import type { Fornecedor, TransacaoExpandida } from "@/lib/types";
import {
  CATEGORIZACAO_VAZIA,
  SeletorCategorizacao,
  type ValorCategorizacao,
} from "./SeletorCategorizacao";

export function EditarTransacaoModal({
  transacao,
  fornecedores,
  onClose,
  onSalvo,
}: {
  transacao: TransacaoExpandida | null;
  fornecedores: Fornecedor[];
  onClose: () => void;
  onSalvo: () => void;
}) {
  const [valor, setValor] = useState<ValorCategorizacao>(CATEGORIZACAO_VAZIA);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!transacao) return;
    setValor({
      fornecedorNome: transacao.fornecedor?.nome ?? "",
      fornecedorIdExistente: transacao.fornecedor?.id ?? null,
      categoriaId: transacao.categoria?.id ?? "",
      subcategoriaId: transacao.subcategoria?.id ?? "",
    });
  }, [transacao]);

  const podeSalvar = Boolean(
    valor.fornecedorNome.trim() && valor.categoriaId && valor.subcategoriaId
  );

  async function salvar() {
    if (!transacao) return;
    setSalvando(true);
    try {
      const fornecedorId = await resolverFornecedorId(valor);
      if (!fornecedorId) {
        toast.error("Não foi possível resolver o fornecedor.");
        return;
      }

      const res = await fetch(`/api/transacoes/${transacao.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fornecedorId,
          categoriaId: valor.categoriaId,
          subcategoriaId: valor.subcategoriaId,
        }),
      });
      if (!res.ok) throw new Error();

      toast.success("Transação categorizada.");
      onSalvo();
      onClose();
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ModalShell
      aberto={transacao !== null}
      onOpenChange={(aberto) => {
        if (!aberto) onClose();
      }}
      titulo={`Editar categorização — ${
        transacao?.fornecedor?.nome ?? transacao?.descricaoBruta ?? ""
      }`}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button onClick={salvar} disabled={!podeSalvar || salvando}>
            Salvar
          </Button>
        </>
      }
    >
      <SeletorCategorizacao
        valor={valor}
        onChange={setValor}
        fornecedores={fornecedores}
        idPrefixo="editar"
      />
    </ModalShell>
  );
}
