"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCategorias } from "@/components/shared/CategoriasProvider";
import { ModalShell } from "@/components/shared/ModalShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FornecedorComVariacoes } from "@/lib/types";

export type EstadoModalFornecedor =
  | { modo: "novo" }
  | { modo: "editar"; fornecedor: FornecedorComVariacoes }
  | null;

export function FornecedorModal({
  estado,
  onClose,
  onSalvo,
}: {
  estado: EstadoModalFornecedor;
  onClose: () => void;
  onSalvo: () => void;
}) {
  const { categorias, subcategorias } = useCategorias();
  const [nome, setNome] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [subcategoriaId, setSubcategoriaId] = useState("");
  const [variacoesExistentes, setVariacoesExistentes] = useState<
    { id: string; textoBruto: string }[]
  >([]);
  const [novaVariacao, setNovaVariacao] = useState("");
  const [variacoesNovas, setVariacoesNovas] = useState<string[]>([]);
  const [perguntarRetroativo, setPerguntarRetroativo] = useState(false);
  const [atualizarConfirmadas, setAtualizarConfirmadas] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const subcategoriasDaCategoria = subcategorias.filter(
    (s) => s.categoriaId === categoriaId
  );

  useEffect(() => {
    if (estado?.modo === "editar") {
      setNome(estado.fornecedor.nome);
      setCategoriaId(estado.fornecedor.categoriaId ?? "");
      setSubcategoriaId(estado.fornecedor.subcategoriaId ?? "");
      setVariacoesExistentes(
        estado.fornecedor.variacoes.map((v) => ({ id: v.id, textoBruto: v.textoBruto }))
      );
      setPerguntarRetroativo(estado.fornecedor.transacoesVinculadas > 0);
      setAtualizarConfirmadas(false);
    } else if (estado?.modo === "novo") {
      setNome("");
      setCategoriaId("");
      setSubcategoriaId("");
      setVariacoesExistentes([]);
      setPerguntarRetroativo(false);
      setAtualizarConfirmadas(false);
    }
    setVariacoesNovas([]);
    setNovaVariacao("");
  }, [estado]);

  function adicionarVariacao() {
    const texto = novaVariacao.trim();
    if (!texto) return;
    setVariacoesNovas((v) => [...v, texto]);
    setNovaVariacao("");
  }

  async function removerVariacaoExistente(id: string) {
    setVariacoesExistentes((v) => v.filter((x) => x.id !== id));
    await fetch(`/api/fornecedor-variacoes/${id}`, { method: "DELETE" });
  }

  const podeSalvar = Boolean(nome.trim() && categoriaId && subcategoriaId);

  async function salvar() {
    if (!estado || !podeSalvar) return;
    setSalvando(true);
    try {
      if (estado.modo === "novo") {
        const res = await fetch("/api/fornecedores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: nome.trim(),
            categoriaId,
            subcategoriaId,
            variacoes: variacoesNovas,
          }),
        });
        if (!res.ok) throw new Error();
      } else {
        const res = await fetch(`/api/fornecedores/${estado.fornecedor.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: nome.trim(),
            categoriaId,
            subcategoriaId,
            variacoesAdicionar: variacoesNovas,
            atualizarConfirmadas: perguntarRetroativo ? atualizarConfirmadas : undefined,
          }),
        });
        if (!res.ok) throw new Error();
      }

      toast.success("Fornecedor salvo.");
      onSalvo();
      onClose();
    } catch {
      toast.error("Erro ao salvar fornecedor.");
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
      titulo={estado?.modo === "editar" ? "Editar fornecedor" : "Novo fornecedor"}
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
      <div className="space-y-1">
        <Label className="text-xs">Nome</Label>
        <Input value={nome} onChange={(e) => setNome(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Categoria</Label>
          <Select
            items={Object.fromEntries(categorias.map((c) => [c.id, c.nome]))}
            value={categoriaId || null}
            onValueChange={(v) => {
              setCategoriaId((v as string) ?? "");
              setSubcategoriaId("");
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Subcategoria</Label>
          <Select
            items={Object.fromEntries(subcategoriasDaCategoria.map((s) => [s.id, s.nome]))}
            value={subcategoriaId || null}
            onValueChange={(v) => setSubcategoriaId((v as string) ?? "")}
            disabled={!categoriaId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {subcategoriasDaCategoria.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Variações de texto conhecidas</Label>
        <div className="flex flex-wrap gap-1.5">
          {variacoesExistentes.map((v) => (
            <span
              key={v.id}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"
            >
              {v.textoBruto}
              <button type="button" onClick={() => removerVariacaoExistente(v.id)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {variacoesNovas.map((v, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"
            >
              {v}
              <button
                type="button"
                onClick={() => setVariacoesNovas((arr) => arr.filter((_, idx) => idx !== i))}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={novaVariacao}
            onChange={(e) => setNovaVariacao(e.target.value)}
            placeholder="Texto bruto do extrato"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                adicionarVariacao();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={adicionarVariacao}>
            Adicionar
          </Button>
        </div>
      </div>

      {perguntarRetroativo ? (
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={atualizarConfirmadas}
            onCheckedChange={(v) => setAtualizarConfirmadas(Boolean(v))}
          />
          Atualizar também as transações já confirmadas desse fornecedor?
        </label>
      ) : null}
    </ModalShell>
  );
}
