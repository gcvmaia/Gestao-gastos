"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ColorPicker } from "@/components/shared/ColorPicker";
import { ModalShell } from "@/components/shared/ModalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PALETA_CORES_CATEGORIA } from "@/lib/constants";
import type { Categoria } from "@/lib/types";

export type EstadoModalCategoria =
  | { modo: "novo" }
  | { modo: "editar"; categoria: Categoria }
  | null;

export function CategoriaModal({
  estado,
  onClose,
  onSalvo,
}: {
  estado: EstadoModalCategoria;
  onClose: () => void;
  onSalvo: () => void;
}) {
  const [nome, setNome] = useState("");
  const [cor, setCor] = useState<string>(PALETA_CORES_CATEGORIA[0]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (estado?.modo === "editar") {
      setNome(estado.categoria.nome);
      setCor(estado.categoria.cor);
    } else if (estado?.modo === "novo") {
      setNome("");
      setCor(PALETA_CORES_CATEGORIA[0]);
    }
  }, [estado]);

  async function salvar() {
    if (!estado || !nome.trim()) return;
    setSalvando(true);
    try {
      const rota =
        estado.modo === "editar" ? `/api/categorias/${estado.categoria.id}` : "/api/categorias";
      const metodo = estado.modo === "editar" ? "PATCH" : "POST";
      const res = await fetch(rota, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim(), cor }),
      });
      if (!res.ok) throw new Error();

      toast.success("Categoria salva.");
      onSalvo();
      onClose();
    } catch {
      toast.error("Erro ao salvar categoria.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ModalShell
      aberto={estado !== null}
      onOpenChange={(aberto) => {
        if (!aberto) onClose();
      }}
      titulo={estado?.modo === "editar" ? "Editar categoria" : "Nova categoria"}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button onClick={salvar} disabled={!nome.trim() || salvando}>
            Salvar
          </Button>
        </>
      }
    >
      <div className="space-y-1">
        <Label className="text-xs">Nome</Label>
        <Input value={nome} onChange={(e) => setNome(e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Cor</Label>
        <ColorPicker valor={cor} onChange={setCor} />
      </div>
    </ModalShell>
  );
}
