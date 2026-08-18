"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ModalShell } from "@/components/shared/ModalShell";
import { Button } from "@/components/ui/button";
import type { Fornecedor } from "@/lib/types";

export function ExcluirFornecedorModal({
  fornecedor,
  onClose,
  onExcluido,
}: {
  fornecedor: Fornecedor | null;
  onClose: () => void;
  onExcluido: () => void;
}) {
  const [excluindo, setExcluindo] = useState(false);

  async function excluir() {
    if (!fornecedor) return;
    setExcluindo(true);
    try {
      const res = await fetch(`/api/fornecedores/${fornecedor.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();

      toast.success("Fornecedor excluído.");
      onExcluido();
      onClose();
    } catch {
      toast.error("Erro ao excluir fornecedor.");
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <ModalShell
      aberto={fornecedor !== null}
      onOpenChange={(aberto) => {
        if (!aberto) onClose();
      }}
      titulo={`Excluir fornecedor — ${fornecedor?.nome ?? ""}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={excluindo}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={excluir} disabled={excluindo}>
            Excluir
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted-foreground">
        As transações que já usavam esse fornecedor mantêm a categoria e subcategoria atuais,
        mas deixam de estar vinculadas a ele — voltam a mostrar o texto original do extrato.
        Isso não afeta a categorização já feita, só o reconhecimento automático futuro desse
        fornecedor.
      </p>
    </ModalShell>
  );
}
