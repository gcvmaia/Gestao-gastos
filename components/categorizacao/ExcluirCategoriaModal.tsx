"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ModalShell } from "@/components/shared/ModalShell";
import { Button } from "@/components/ui/button";

export type AlvoExclusao = {
  tipo: "categoria" | "subcategoria";
  id: string;
  nome: string;
} | null;

/** Modal compartilhado — mesma lógica de aviso pra excluir categoria ou subcategoria. */
export function ExcluirCategoriaModal({
  alvo,
  onClose,
  onExcluido,
}: {
  alvo: AlvoExclusao;
  onClose: () => void;
  onExcluido: () => void;
}) {
  const [contagem, setContagem] = useState<number | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    if (!alvo) {
      setContagem(null);
      return;
    }
    const param = alvo.tipo === "categoria" ? "categoriaIds" : "subcategoriaIds";
    fetch(`/api/transacoes?${param}=${alvo.id}`)
      .then((r) => r.json())
      .then((transacoes: unknown[]) => setContagem(transacoes.length));
  }, [alvo]);

  async function excluir() {
    if (!alvo) return;
    setExcluindo(true);
    try {
      const rota =
        alvo.tipo === "categoria" ? `/api/categorias/${alvo.id}` : `/api/subcategorias/${alvo.id}`;
      const res = await fetch(rota, { method: "DELETE" });
      if (!res.ok) throw new Error();

      toast.success(`${alvo.tipo === "categoria" ? "Categoria" : "Subcategoria"} excluída.`);
      onExcluido();
      onClose();
    } catch {
      toast.error("Erro ao excluir.");
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <ModalShell
      aberto={alvo !== null}
      onOpenChange={(aberto) => {
        if (!aberto) onClose();
      }}
      titulo={`Excluir ${alvo?.nome ?? ""}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={excluindo}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={excluir}
            disabled={excluindo || contagem === null}
          >
            Excluir
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted-foreground">
        {contagem === null
          ? "Carregando..."
          : contagem === 0
            ? "Tem certeza que deseja excluir?"
            : `${contagem} transações vão ficar sem classificação. Elas voltam para o status Pendente no Extrato — você pode categorizá-las de novo a qualquer momento, inclusive usando a categoria/subcategoria "Outros" se preferir. Tem certeza que deseja continuar?`}
      </p>
    </ModalShell>
  );
}
