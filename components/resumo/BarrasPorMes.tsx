"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Surface } from "@/components/shared/Surface";
import type { ResumoPayload } from "@/lib/resumo/calculos";

const formatadorMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatarMes(mes: string): string {
  const [ano, m] = mes.split("-");
  return new Date(Number(ano), Number(m) - 1, 1).toLocaleDateString("pt-BR", {
    month: "short",
    year: "2-digit",
  });
}

export function BarrasPorMes({ barras }: { barras: ResumoPayload["barrasPorMes"] }) {
  if (barras.length === 0) {
    return (
      <Surface className="flex h-72 items-center justify-center text-center text-sm text-muted-foreground">
        Sem gastos confirmados no período.
      </Surface>
    );
  }

  const dados = barras.map((b) => ({ ...b, mesLabel: formatarMes(b.mes) }));

  return (
    <Surface>
      <h2 className="mb-2 text-sm font-medium">Gasto por Mês</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-strong)" />
            <XAxis dataKey="mesLabel" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              width={70}
              tickFormatter={(v: number) => formatadorMoeda.format(v)}
            />
            <Tooltip formatter={(valor) => formatadorMoeda.format(Number(valor))} />
            <Bar
              dataKey="valor"
              fill="#2B3B34"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Surface>
  );
}
