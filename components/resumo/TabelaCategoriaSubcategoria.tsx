"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { Fragment, useState } from "react";
import { DynamicIcon } from "@/components/shared/DynamicIcon";
import { Surface } from "@/components/shared/Surface";
import type { ResumoPayload } from "@/lib/resumo/calculos";

export function TabelaCategoriaSubcategoria({
  arvore,
}: {
  arvore: ResumoPayload["arvore"];
}) {
  const [expandidas, setExpandidas] = useState<Set<string>>(new Set());

  function alternar(id: string) {
    setExpandidas((s) => {
      const novo = new Set(s);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  if (arvore.length === 0) {
    return (
      <Surface className="py-10 text-center text-sm text-muted-foreground">
        Sem gastos confirmados no período.
      </Surface>
    );
  }

  return (
    <Surface className="overflow-hidden p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-strong text-left text-xs text-muted-foreground">
            <th className="px-3 py-2 font-medium">Categoria/Subcategoria</th>
            <th className="px-3 py-2 font-medium">% do total gasto</th>
            <th className="px-3 py-2 font-medium">Dia de pico</th>
          </tr>
        </thead>
        <tbody>
          {arvore.map((categoria) => {
            const expandida = expandidas.has(categoria.categoriaId);
            return (
              <Fragment key={categoria.categoriaId}>
                <tr className="border-b border-border-strong">
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => alternar(categoria.categoriaId)}
                      className="flex items-center gap-2 font-medium"
                      disabled={categoria.subcategorias.length === 0}
                    >
                      {categoria.subcategorias.length > 0 ? (
                        expandida ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )
                      ) : (
                        <span className="w-4" />
                      )}
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: categoria.cor }}
                      />
                      {categoria.nome}
                    </button>
                  </td>
                  <td className="px-3 py-2">{categoria.percentualDoTotal.toFixed(1)}%</td>
                  <td className="px-3 py-2">{categoria.diaDePico ?? "—"}</td>
                </tr>
                {expandida
                  ? categoria.subcategorias.map((sub) => (
                      <tr
                        key={sub.subcategoriaId}
                        className="border-b border-border-strong bg-muted/30"
                      >
                        <td className="py-1.5 pr-3 pl-9">
                          <span className="flex items-center gap-2">
                            <DynamicIcon
                              name={sub.icone}
                              className="h-3.5 w-3.5 text-muted-foreground"
                            />
                            {sub.nome}
                          </span>
                        </td>
                        <td className="px-3 py-1.5">{sub.percentualDoTotal.toFixed(1)}%</td>
                        <td className="px-3 py-1.5">{sub.diaDePico ?? "—"}</td>
                      </tr>
                    ))
                  : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </Surface>
  );
}
