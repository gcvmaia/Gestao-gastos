"use client";

import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { DynamicIcon } from "@/components/shared/DynamicIcon";
import { Surface } from "@/components/shared/Surface";
import type { ResumoPayload } from "@/lib/resumo/calculos";

const formatadorMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

type ItemDonut = { id: string; nome: string; valor: number; cor: string; icone?: string };

function misturarComBranco(hex: string, quantidade: number): string {
  const num = Number.parseInt(hex.replace("#", ""), 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const mesclar = (c: number) => Math.round(c + (255 - c) * quantidade);
  return `rgb(${mesclar(r)}, ${mesclar(g)}, ${mesclar(b)})`;
}

/** Nível 1: categorias (cor própria). Ao clicar numa fatia, entra no nível 2:
 * subcategorias daquela categoria (tons derivados da cor da categoria, ícone
 * na legenda). Drill-down é navegação local, não afeta filtro/tabela/texto. */
export function DonutCategorias({ donut }: { donut: ResumoPayload["donut"] }) {
  const [categoriaAtivaId, setCategoriaAtivaId] = useState<string | null>(null);
  const categoriaAtiva = donut.find((c) => c.categoriaId === categoriaAtivaId) ?? null;

  if (donut.length === 0) {
    return (
      <Surface className="flex h-72 items-center justify-center text-center text-sm text-muted-foreground">
        Sem gastos confirmados no período.
      </Surface>
    );
  }

  const dados: ItemDonut[] = categoriaAtiva
    ? categoriaAtiva.subcategorias.map((s, i) => ({
        id: s.subcategoriaId,
        nome: s.nome,
        valor: s.valor,
        cor: misturarComBranco(
          categoriaAtiva.cor,
          0.15 + (categoriaAtiva.subcategorias.length <= 1 ? 0 : i / (categoriaAtiva.subcategorias.length - 1)) * 0.55
        ),
        icone: s.icone,
      }))
    : donut.map((c) => ({ id: c.categoriaId, nome: c.nome, valor: c.valor, cor: c.cor }));

  return (
    <Surface>
      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
        {categoriaAtiva ? (
          <button
            type="button"
            onClick={() => setCategoriaAtivaId(null)}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" /> {categoriaAtiva.nome}
          </button>
        ) : (
          <span>Gastos por Categoria</span>
        )}
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dados}
              dataKey="valor"
              nameKey="nome"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={dados.length > 1 ? 2 : 0}
              isAnimationActive={false}
              onClick={(_data, index) => {
                if (!categoriaAtiva) setCategoriaAtivaId(dados[index].id);
              }}
            >
              {dados.map((d) => (
                <Cell
                  key={d.id}
                  fill={d.cor}
                  className={categoriaAtiva ? undefined : "cursor-pointer"}
                />
              ))}
            </Pie>
            <Tooltip formatter={(valor) => formatadorMoeda.format(Number(valor))} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-2 space-y-1 text-sm">
        {dados.map((d) => (
          <li key={d.id} className="flex items-center gap-2">
            {d.icone ? (
              <DynamicIcon name={d.icone} className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.cor }} />
            )}
            <span className="flex-1">{d.nome}</span>
            <span className="text-muted-foreground">{formatadorMoeda.format(d.valor)}</span>
          </li>
        ))}
      </ul>
    </Surface>
  );
}
