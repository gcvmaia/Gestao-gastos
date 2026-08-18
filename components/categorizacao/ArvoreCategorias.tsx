"use client";

import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { DynamicIcon } from "@/components/shared/DynamicIcon";
import { Button } from "@/components/ui/button";
import type { Categoria, Subcategoria } from "@/lib/types";

export function ArvoreCategorias({
  categorias,
  subcategorias,
  onNovaCategoria,
  onEditarCategoria,
  onExcluirCategoria,
  onNovaSubcategoria,
  onEditarSubcategoria,
  onExcluirSubcategoria,
}: {
  categorias: Categoria[];
  subcategorias: Subcategoria[];
  onNovaCategoria: () => void;
  onEditarCategoria: (categoria: Categoria) => void;
  onExcluirCategoria: (categoria: Categoria) => void;
  onNovaSubcategoria: (categoriaId: string) => void;
  onEditarSubcategoria: (subcategoria: Subcategoria) => void;
  onExcluirSubcategoria: (subcategoria: Subcategoria) => void;
}) {
  const [expandidas, setExpandidas] = useState<Set<string>>(new Set());

  function alternarExpandir(id: string) {
    setExpandidas((s) => {
      const novo = new Set(s);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">Categorias</h2>
        <Button size="sm" variant="outline" className="h-7 gap-1" onClick={onNovaCategoria}>
          <Plus className="h-3.5 w-3.5" /> Nova categoria
        </Button>
      </div>

      <div className="space-y-2">
        {categorias.map((categoria) => {
          const expandida = expandidas.has(categoria.id);
          const subs = subcategorias.filter((s) => s.categoriaId === categoria.id);

          return (
            <div
              key={categoria.id}
              className="rounded-xl border border-border-strong bg-surface-2"
            >
              <div className="flex items-center gap-2 p-3">
                <button
                  type="button"
                  onClick={() => alternarExpandir(categoria.id)}
                  className="text-muted-foreground"
                  aria-label={expandida ? "Colapsar" : "Expandir"}
                >
                  {expandida ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: categoria.cor }}
                />
                <span className="flex-1 text-sm font-medium">{categoria.nome}</span>
                {!categoria.protegida ? (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditarCategoria(categoria)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onExcluirCategoria(categoria)}
                    >
                      Excluir
                    </Button>
                  </div>
                ) : null}
              </div>

              {expandida ? (
                <div className="space-y-1 border-t border-border-strong px-3 py-2 pl-9">
                  {subs.map((sub) => (
                    <div key={sub.id} className="flex items-center gap-2 py-1 text-sm">
                      <DynamicIcon
                        name={sub.icone}
                        className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                      />
                      <span className="flex-1">{sub.nome}</span>
                      {!sub.protegida ? (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditarSubcategoria(sub)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onExcluirSubcategoria(sub)}
                          >
                            Excluir
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-xs"
                    onClick={() => onNovaSubcategoria(categoria.id)}
                  >
                    <Plus className="h-3 w-3" /> Nova subcategoria
                  </Button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
