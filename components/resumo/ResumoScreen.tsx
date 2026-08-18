"use client";

import { useEffect, useState } from "react";
import { FilterPill } from "@/components/shared/FilterPill";
import { IndicatorHeroBar } from "@/components/shared/IndicatorBar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ResumoPayload } from "@/lib/resumo/calculos";
import { BarrasPorMes } from "./BarrasPorMes";
import { DonutCategorias } from "./DonutCategorias";
import { TabelaCategoriaSubcategoria } from "./TabelaCategoriaSubcategoria";
import { TextoAnalise } from "./TextoAnalise";

const formatadorMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

type ResumoResposta = ResumoPayload & { textoAnalise: string };

export function ResumoScreen() {
  const [periodoDe, setPeriodoDe] = useState("");
  const [periodoAte, setPeriodoAte] = useState("");
  const [resumo, setResumo] = useState<ResumoResposta | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (periodoDe) params.set("periodoDe", periodoDe);
    if (periodoAte) params.set("periodoAte", periodoAte);

    fetch(`/api/resumo?${params.toString()}`)
      .then((r) => r.json())
      .then(setResumo);
  }, [periodoDe, periodoAte]);

  const periodoLabel =
    periodoDe || periodoAte ? `${periodoDe || "…"} – ${periodoAte || "…"}` : "Período";

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Resumo</h1>
        <FilterPill label={periodoLabel} ativo={Boolean(periodoDe || periodoAte)} align="end">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">De</Label>
              <Input
                type="date"
                value={periodoDe}
                onChange={(e) => setPeriodoDe(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Até</Label>
              <Input
                type="date"
                value={periodoAte}
                onChange={(e) => setPeriodoAte(e.target.value)}
              />
            </div>
          </div>
        </FilterPill>
      </div>

      {resumo && resumo.transparencia.naoConfirmadas > 0 ? (
        <p className="mt-2 rounded-md bg-amber-100 px-3 py-2 text-sm text-amber-900">
          {resumo.transparencia.naoConfirmadas} transações ainda não confirmadas não entram
          nesse resumo.
        </p>
      ) : null}

      {resumo ? (
        <>
          <div className="mt-4">
            <IndicatorHeroBar
              itens={[
                {
                  chave: "receita",
                  label: "Receita total",
                  valor: formatadorMoeda.format(resumo.indicadores.receitaTotal),
                },
                {
                  chave: "saldo",
                  label: "Saldo líquido",
                  valor: formatadorMoeda.format(resumo.indicadores.saldoLiquido),
                },
                {
                  chave: "media",
                  label: "Média mensal de gasto",
                  valor: formatadorMoeda.format(resumo.indicadores.mediaMensalGasto),
                },
              ]}
              destaque={{
                label: "Total gasto",
                valor: formatadorMoeda.format(resumo.indicadores.totalGasto),
              }}
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <DonutCategorias donut={resumo.donut} />
            <BarrasPorMes barras={resumo.barrasPorMes} />
          </div>

          <div className="mt-4">
            <TabelaCategoriaSubcategoria arvore={resumo.arvore} />
          </div>

          <div className="mt-4">
            <TextoAnalise texto={resumo.textoAnalise} />
          </div>
        </>
      ) : (
        <p className="mt-8 text-sm text-muted-foreground">Carregando...</p>
      )}
    </div>
  );
}
