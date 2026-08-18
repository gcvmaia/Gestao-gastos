"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ModalShell } from "@/components/shared/ModalShell";
import { Button } from "@/components/ui/button";
import type { ExtratoImportacao, TransacaoExpandida } from "@/lib/types";

export function RemoverImportacaoModal({
  importacao,
  onClose,
  onRemovido,
}: {
  importacao: ExtratoImportacao | null;
  onClose: () => void;
  onRemovido: () => void;
}) {
  const [contagem, setContagem] = useState<{ total: number; confirmadas: number } | null>(
    null
  );
  const [removendo, setRemovendo] = useState(false);

  useEffect(() => {
    if (!importacao) {
      setContagem(null);
      return;
    }
    fetch(`/api/transacoes?importacaoId=${importacao.id}`)
      .then((r) => r.json())
      .then((transacoes: TransacaoExpandida[]) => {
        setContagem({
          total: transacoes.length,
          confirmadas: transacoes.filter((t) => t.status === "confirmada").length,
        });
      });
  }, [importacao]);

  async function remover() {
    if (!importacao) return;
    setRemovendo(true);
    try {
      const res = await fetch(`/api/importacoes/${importacao.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();

      toast.success("Importação removida.");
      onRemovido();
      onClose();
    } catch {
      toast.error("Erro ao remover importação.");
    } finally {
      setRemovendo(false);
    }
  }

  return (
    <ModalShell
      aberto={importacao !== null}
      onOpenChange={(aberto) => {
        if (!aberto) onClose();
      }}
      titulo={`Remover importação — ${importacao?.nomeArquivo ?? ""}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={removendo}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={remover}
            disabled={removendo || !contagem}
          >
            Remover
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted-foreground">
        {contagem
          ? `Isso vai excluir ${contagem.total} transações, ${contagem.confirmadas} delas já categorizadas. Essa ação não pode ser desfeita.`
          : "Carregando..."}
      </p>
    </ModalShell>
  );
}
