"use client";

import { CategoriaBadge } from "@/components/shared/CategoriaBadge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { TransacaoExpandida } from "@/lib/types";
import { cn } from "@/lib/utils";
import { StatusFlag } from "./StatusFlag";

const formatadorData = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
const formatadorMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function TabelaTransacoes({
  transacoes,
  selecionadas,
  onToggleSelecao,
  onToggleSelecaoTodas,
  onToggleFlag,
  onEditar,
  temImportacao,
}: {
  transacoes: TransacaoExpandida[];
  selecionadas: Set<string>;
  onToggleSelecao: (id: string) => void;
  onToggleSelecaoTodas: () => void;
  onToggleFlag: (id: string, statusAtual: TransacaoExpandida["status"]) => void;
  onEditar: (transacao: TransacaoExpandida) => void;
  temImportacao: boolean;
}) {
  if (transacoes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border-strong bg-surface-2 py-16 text-center">
        <p className="text-sm font-medium">
          {temImportacao
            ? "Nenhuma transação encontrada"
            : "Nenhum extrato importado ainda"}
        </p>
        {!temImportacao ? (
          <p className="text-sm text-muted-foreground">
            Use o botão &quot;Importar&quot; na barra de filtros pra trazer seu
            primeiro extrato.
          </p>
        ) : null}
      </div>
    );
  }

  const todasVisiveisSelecionadas = transacoes.every((t) =>
    selecionadas.has(t.id)
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-border-strong bg-surface-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={todasVisiveisSelecionadas}
                onCheckedChange={onToggleSelecaoTodas}
                aria-label="Selecionar todas"
              />
            </TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Fornecedor</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead />
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {transacoes.map((t) => (
            <TableRow key={t.id}>
              <TableCell>
                <Checkbox
                  checked={selecionadas.has(t.id)}
                  onCheckedChange={() => onToggleSelecao(t.id)}
                  aria-label="Selecionar transação"
                />
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {formatadorData.format(new Date(`${t.data}T00:00:00`))}
              </TableCell>
              <TableCell className="max-w-[220px] truncate">
                {t.fornecedor?.nome ?? t.descricaoBruta}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right font-medium whitespace-nowrap",
                  t.valor < 0 ? "text-red-600" : "text-emerald-600"
                )}
              >
                {t.moedaOriginal ? (
                  <Tooltip>
                    <TooltipTrigger className="inline-flex items-center gap-1">
                      {formatadorMoeda.format(t.valor)}
                      <span className="text-[10px] font-normal text-muted-foreground">
                        {t.moedaOriginal}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Original: {t.valorOriginal?.toFixed(2)} {t.moedaOriginal}
                      {t.cotacaoUsada
                        ? ` · cotação ${t.cotacaoUsada.toFixed(4)}`
                        : ""}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  formatadorMoeda.format(t.valor)
                )}
              </TableCell>
              <TableCell>
                <CategoriaBadge categoria={t.categoria} subcategoria={t.subcategoria} />
              </TableCell>
              <TableCell>
                <StatusFlag
                  status={t.status}
                  possivelDuplicado={t.possivelDuplicado}
                  onToggle={() => onToggleFlag(t.id, t.status)}
                />
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => onEditar(t)}>
                  Editar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
