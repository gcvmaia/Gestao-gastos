"use client";

import { Button } from "@/components/ui/button";
import type { ExtratoImportacao } from "@/lib/types";

const formatadorData = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** Fica no rodapé da página, não no topo (ver layout.md v2). */
export function HistoricoImportacoes({
  importacoes,
  onRemover,
}: {
  importacoes: ExtratoImportacao[];
  onRemover: (importacao: ExtratoImportacao) => void;
}) {
  if (importacoes.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
        Histórico de Importações
      </h2>
      <div className="overflow-x-auto rounded-xl border border-border-strong bg-surface-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-strong text-left text-xs text-muted-foreground">
              <th className="px-3 py-2 font-medium">Arquivo</th>
              <th className="px-3 py-2 font-medium">Data</th>
              <th className="px-3 py-2 font-medium">Transações</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {importacoes.map((imp) => (
              <tr key={imp.id} className="border-b border-border-strong last:border-0">
                <td className="px-3 py-2">{imp.nomeArquivo}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {formatadorData.format(new Date(imp.dataImportacao))}
                </td>
                <td className="px-3 py-2">{imp.quantidadeTransacoes}</td>
                <td className="px-3 py-2 text-right">
                  <Button variant="ghost" size="sm" onClick={() => onRemover(imp)}>
                    Remover
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
