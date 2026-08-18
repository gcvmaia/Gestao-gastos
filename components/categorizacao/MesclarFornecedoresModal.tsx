"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ModalShell } from "@/components/shared/ModalShell";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Fornecedor } from "@/lib/types";

export function MesclarFornecedoresModal({
  principal,
  fornecedores,
  onClose,
  onMesclado,
}: {
  principal: Fornecedor | null;
  fornecedores: Fornecedor[];
  onClose: () => void;
  onMesclado: () => void;
}) {
  const [secundarioId, setSecundarioId] = useState<string>("");
  const [mesclando, setMesclando] = useState(false);

  useEffect(() => {
    setSecundarioId("");
  }, [principal]);

  const opcoes = fornecedores.filter((f) => f.id !== principal?.id);

  async function mesclar() {
    if (!principal || !secundarioId) return;
    setMesclando(true);
    try {
      const res = await fetch(`/api/fornecedores/${principal.id}/mesclar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secundarioId }),
      });
      if (!res.ok) throw new Error();

      toast.success("Fornecedores mesclados.");
      onMesclado();
      onClose();
    } catch {
      toast.error("Erro ao mesclar fornecedores.");
    } finally {
      setMesclando(false);
    }
  }

  return (
    <ModalShell
      aberto={principal !== null}
      onOpenChange={(aberto) => {
        if (!aberto) onClose();
      }}
      titulo="Mesclar fornecedores"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={mesclando}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={mesclar}
            disabled={!secundarioId || mesclando}
          >
            Mesclar
          </Button>
        </>
      }
    >
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Fornecedor principal</p>
        <p className="text-sm font-medium">{principal?.nome}</p>
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Fornecedor a mesclar</p>
        <Select
          items={Object.fromEntries(opcoes.map((f) => [f.id, f.nome]))}
          value={secundarioId || null}
          onValueChange={(v) => setSecundarioId((v as string) ?? "")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {opcoes.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="text-xs text-muted-foreground">
        Não pode ser desfeito — variações e transações do fornecedor secundário migram pro
        principal, e ele deixa de existir no catálogo.
      </p>
    </ModalShell>
  );
}
