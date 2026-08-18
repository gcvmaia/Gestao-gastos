"use client";

import { useCategorias } from "@/components/shared/CategoriasProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Fornecedor } from "@/lib/types";

export type ValorCategorizacao = {
  fornecedorNome: string;
  /** null = fornecedor novo, ainda não existe no catálogo (será criado ao aplicar). */
  fornecedorIdExistente: string | null;
  categoriaId: string;
  subcategoriaId: string;
};

export const CATEGORIZACAO_VAZIA: ValorCategorizacao = {
  fornecedorNome: "",
  fornecedorIdExistente: null,
  categoriaId: "",
  subcategoriaId: "",
};

/**
 * Fornecedor (autocomplete existente-ou-novo) + Categoria/Subcategoria em
 * cascata, auto-preenchidos a partir do fornecedor escolhido — sempre
 * editável. Reusado pelo painel de categorização em massa e pelo modal de
 * edição individual (ver telas/interface-extrato.md).
 */
export function SeletorCategorizacao({
  valor,
  onChange,
  fornecedores,
  idPrefixo,
}: {
  valor: ValorCategorizacao;
  onChange: (valor: ValorCategorizacao) => void;
  fornecedores: Fornecedor[];
  idPrefixo: string;
}) {
  const { categorias, subcategorias } = useCategorias();
  const subcategoriasDaCategoria = subcategorias.filter(
    (s) => s.categoriaId === valor.categoriaId
  );

  function alterarNomeFornecedor(nome: string) {
    const existente = fornecedores.find(
      (f) => f.nome.toLowerCase() === nome.trim().toLowerCase()
    );
    onChange({
      fornecedorNome: nome,
      fornecedorIdExistente: existente?.id ?? null,
      categoriaId: existente?.categoriaId ?? valor.categoriaId,
      subcategoriaId: existente?.subcategoriaId ?? valor.subcategoriaId,
    });
  }

  const datalistId = `${idPrefixo}-fornecedores`;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="space-y-1">
        <Label className="text-xs">Fornecedor</Label>
        <Input
          value={valor.fornecedorNome}
          onChange={(e) => alterarNomeFornecedor(e.target.value)}
          placeholder="Nome existente ou novo"
          list={datalistId}
        />
        <datalist id={datalistId}>
          {fornecedores.map((f) => (
            <option key={f.id} value={f.nome} />
          ))}
        </datalist>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Categoria</Label>
        <Select
          items={Object.fromEntries(categorias.map((c) => [c.id, c.nome]))}
          value={valor.categoriaId || null}
          onValueChange={(categoriaId) =>
            onChange({
              ...valor,
              categoriaId: (categoriaId as string) ?? "",
              subcategoriaId: "",
            })
          }
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
          value={valor.subcategoriaId || null}
          onValueChange={(subcategoriaId) =>
            onChange({ ...valor, subcategoriaId: (subcategoriaId as string) ?? "" })
          }
          disabled={!valor.categoriaId}
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
  );
}
