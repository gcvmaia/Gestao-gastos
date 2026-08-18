"use client";

import { PieChart, Receipt, Tags, type LucideIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type Tela = "extrato" | "categorizacao" | "resumo";

const ITENS: { id: Tela; label: string; icon: LucideIcon }[] = [
  { id: "extrato", label: "Extrato", icon: Receipt },
  { id: "categorizacao", label: "Categorização", icon: Tags },
  { id: "resumo", label: "Resumo", icon: PieChart },
];

export function Sidebar({
  ativo,
  onSelect,
}: {
  ativo: Tela;
  onSelect: (tela: Tela) => void;
}) {
  return (
    <nav
      className="fixed top-0 left-0 z-40 flex h-screen w-14 flex-col items-center gap-2 py-4"
      style={{ backgroundColor: "#0F3D30" }}
    >
      {ITENS.map((item) => {
        const isAtivo = item.id === ativo;
        const Icon = item.icon;
        return (
          <Tooltip key={item.id}>
            <TooltipTrigger
              onClick={() => onSelect(item.id)}
              aria-label={item.label}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                isAtivo ? "bg-white/[0.14]" : "hover:bg-white/[0.08]"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  isAtivo ? "text-white" : "text-white/50"
                )}
              />
            </TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}
