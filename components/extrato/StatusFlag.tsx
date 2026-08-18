"use client";

import { AlertTriangle, Flag } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { StatusTransacao } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

/**
 * Flag de sugestão (clicável, alterna sugerida↔confirmada sem alterar
 * categorização) + ícone de possível duplicado (só informativo, não clicável).
 */
export function StatusFlag({
  status,
  possivelDuplicado,
  onToggle,
}: {
  status: StatusTransacao;
  possivelDuplicado: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {status !== "pendente" ? (
        <Tooltip>
          <TooltipTrigger
            onClick={onToggle}
            aria-label={
              status === "sugerida" ? "Marcar como confirmada" : "Marcar como sugerida"
            }
            className="text-muted-foreground hover:text-foreground"
          >
            <Flag
              className={cn("h-4 w-4", status === "confirmada" && "fill-current")}
            />
          </TooltipTrigger>
          <TooltipContent>
            {status === "sugerida" ? "Sugerida — clique pra confirmar" : "Confirmada"}
          </TooltipContent>
        </Tooltip>
      ) : null}
      {possivelDuplicado ? (
        <Tooltip>
          <TooltipTrigger className="cursor-default text-amber-600">
            <AlertTriangle className="h-4 w-4" />
          </TooltipTrigger>
          <TooltipContent>Possível duplicado</TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  );
}
