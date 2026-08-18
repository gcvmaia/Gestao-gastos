"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { IconPicker } from "@/components/shared/IconPicker";
import { ModalShell } from "@/components/shared/ModalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ICONES_SUBCATEGORIA } from "@/lib/constants";
import type { Subcategoria } from "@/lib/types";

export type EstadoModalSubcategoria =
  | { modo: "novo"; categoriaId: string }
  | { modo: "editar"; subcategoria: Subcategoria }
  | null;

export function SubcategoriaModal({
  estado,
  onClose,
  onSalvo,
}: {
  estado: EstadoModalSubcategoria;
  onClose: () => void;
  onSalvo: () => void;
}) {
  const [nome, setNome] = useState("");
  const [icone, setIcone] = useState<string>(ICONES_SUBCATEGORIA[0]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (estado?.modo === "editar") {
      setNome(estado.subcategoria.nome);
      setIcone(estado.subcategoria.icone);
    } else if (estado?.modo === "novo") {
      setNome("");
      setIcone(ICONES_SUBCATEGORIA[0]);
    }
  }, [estado]);

  async function salvar() {
    if (!estado || !nome.trim()) return;
    setSalvando(true);
    try {
      const rota =
        estado.modo === "editar"
          ? `/api/subcategorias/${estado.subcategoria.id}`
          : "/api/subcategorias";
      const metodo = estado.modo === "editar" ? "PATCH" : "POST";
      const body =
        estado.modo === "editar"
          ? { nome: nome.trim(), icone }
          : { categoriaId: estado.categoriaId, nome: nome.trim(), icone };

      const res = await fetch(rota, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();

      toast.success("Subcategoria salva.");
      onSalvo();
      onClose();
    } catch {
      toast.error("Erro ao salvar subcategoria.");
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
      titulo={estado?.modo === "editar" ? "Editar subcategoria" : "Nova subcategoria"}
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
        <Label className="text-xs">Ícone</Label>
        <IconPicker valor={icone} onChange={setIcone} />
      </div>
    </ModalShell>
  );
}
