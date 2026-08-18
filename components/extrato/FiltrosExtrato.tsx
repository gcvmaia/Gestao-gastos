"use client";

import { Upload } from "lucide-react";
import { useRef } from "react";
import { useCategorias } from "@/components/shared/CategoriasProvider";
import { FilterPill } from "@/components/shared/FilterPill";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StatusTransacao } from "@/lib/db/schema";
import type { Fornecedor } from "@/lib/types";

export type FiltrosExtratoState = {
  periodoDe: string;
  periodoAte: string;
  valorMin: string;
  valorMax: string;
  categoriaIds: string[];
  subcategoriaIds: string[];
  status: StatusTransacao | "todos";
  fornecedorTexto: string;
};

export const FILTROS_VAZIOS: FiltrosExtratoState = {
  periodoDe: "",
  periodoAte: "",
  valorMin: "",
  valorMax: "",
  categoriaIds: [],
  subcategoriaIds: [],
  status: "todos",
  fornecedorTexto: "",
};

const OPCOES_STATUS: { valor: StatusTransacao | "todos"; label: string }[] = [
  { valor: "todos", label: "Todos" },
  { valor: "confirmada", label: "Confirmada" },
  { valor: "sugerida", label: "Sugerida" },
  { valor: "pendente", label: "Pendente" },
];

export function FiltrosExtrato({
  filtros,
  onChange,
  fornecedores,
  onArquivoSelecionado,
}: {
  filtros: FiltrosExtratoState;
  onChange: (filtros: FiltrosExtratoState) => void;
  fornecedores: Fornecedor[];
  onArquivoSelecionado: (arquivo: File) => void;
}) {
  const { categorias, subcategorias } = useCategorias();
  const inputArquivoRef = useRef<HTMLInputElement>(null);

  const periodoLabel =
    filtros.periodoDe || filtros.periodoAte
      ? `${filtros.periodoDe || "…"} – ${filtros.periodoAte || "…"}`
      : "Período";
  const valorLabel =
    filtros.valorMin || filtros.valorMax
      ? `R$ ${filtros.valorMin || "0"} – ${filtros.valorMax || "…"}`
      : "Valor";
  const categoriaLabel =
    filtros.categoriaIds.length + filtros.subcategoriaIds.length > 0
      ? `Categoria (${filtros.categoriaIds.length + filtros.subcategoriaIds.length})`
      : "Categoria";
  const statusLabel =
    OPCOES_STATUS.find((o) => o.valor === filtros.status)?.label ?? "Status";

  function alternarCategoria(id: string) {
    const jaSelecionada = filtros.categoriaIds.includes(id);
    onChange({
      ...filtros,
      categoriaIds: jaSelecionada
        ? filtros.categoriaIds.filter((c) => c !== id)
        : [...filtros.categoriaIds, id],
    });
  }

  function alternarSubcategoria(id: string) {
    const jaSelecionada = filtros.subcategoriaIds.includes(id);
    onChange({
      ...filtros,
      subcategoriaIds: jaSelecionada
        ? filtros.subcategoriaIds.filter((c) => c !== id)
        : [...filtros.subcategoriaIds, id],
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterPill label={periodoLabel} ativo={Boolean(filtros.periodoDe || filtros.periodoAte)}>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">De</Label>
            <Input
              type="date"
              value={filtros.periodoDe}
              onChange={(e) => onChange({ ...filtros, periodoDe: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Até</Label>
            <Input
              type="date"
              value={filtros.periodoAte}
              onChange={(e) => onChange({ ...filtros, periodoAte: e.target.value })}
            />
          </div>
        </div>
      </FilterPill>

      <FilterPill label={valorLabel} ativo={Boolean(filtros.valorMin || filtros.valorMax)}>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">De (R$)</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={filtros.valorMin}
              onChange={(e) => onChange({ ...filtros, valorMin: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Até (R$)</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={filtros.valorMax}
              onChange={(e) => onChange({ ...filtros, valorMax: e.target.value })}
            />
          </div>
        </div>
      </FilterPill>

      <FilterPill
        label={categoriaLabel}
        ativo={filtros.categoriaIds.length + filtros.subcategoriaIds.length > 0}
      >
        <div className="max-h-72 space-y-3 overflow-y-auto">
          {categorias.map((categoria) => (
            <div key={categoria.id} className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Checkbox
                  checked={filtros.categoriaIds.includes(categoria.id)}
                  onCheckedChange={() => alternarCategoria(categoria.id)}
                />
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: categoria.cor }}
                />
                {categoria.nome}
              </label>
              <div className="ml-6 space-y-1">
                {subcategorias
                  .filter((s) => s.categoriaId === categoria.id)
                  .map((sub) => (
                    <label key={sub.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Checkbox
                        checked={filtros.subcategoriaIds.includes(sub.id)}
                        onCheckedChange={() => alternarSubcategoria(sub.id)}
                      />
                      {sub.nome}
                    </label>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </FilterPill>

      <FilterPill label={statusLabel} ativo={filtros.status !== "todos"}>
        <div className="space-y-1">
          {OPCOES_STATUS.map((opcao) => (
            <button
              key={opcao.valor}
              type="button"
              onClick={() => onChange({ ...filtros, status: opcao.valor })}
              className="flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted data-[ativo=true]:bg-muted data-[ativo=true]:font-medium"
              data-ativo={filtros.status === opcao.valor}
            >
              {opcao.label}
            </button>
          ))}
        </div>
      </FilterPill>

      <Input
        placeholder="Buscar fornecedor..."
        value={filtros.fornecedorTexto}
        onChange={(e) => onChange({ ...filtros, fornecedorTexto: e.target.value })}
        list="fornecedores-conhecidos"
        className="h-8 w-48 text-xs"
      />
      <datalist id="fornecedores-conhecidos">
        {fornecedores.map((f) => (
          <option key={f.id} value={f.nome} />
        ))}
      </datalist>

      <div className="ml-auto">
        <input
          ref={inputArquivoRef}
          type="file"
          accept=".csv,.xls,.xlsx"
          className="hidden"
          onChange={(e) => {
            const arquivo = e.target.files?.[0];
            if (arquivo) onArquivoSelecionado(arquivo);
            e.target.value = "";
          }}
        />
        <Button
          size="sm"
          className="h-8 gap-1.5"
          onClick={() => inputArquivoRef.current?.click()}
        >
          <Upload className="h-3.5 w-3.5" />
          Importar
        </Button>
      </div>
    </div>
  );
}
