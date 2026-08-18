"use client";

import { ChevronDown } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * Botão pill + popover genérico (ver layout.md "Filtros e Indicadores
 * Compactos v2") — usado por Período, Valor, Categoria e Status.
 */
export function FilterPill({
  label,
  ativo = false,
  children,
  align = "start",
}: {
  label: string;
  ativo?: boolean;
  children: React.ReactNode;
  align?: "start" | "center" | "end";
}) {
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "h-8 gap-1 rounded-full text-xs font-normal",
          ativo && "border-primary/60 text-primary"
        )}
      >
        {label}
        <ChevronDown className="h-3 w-3 opacity-60" />
      </PopoverTrigger>
      <PopoverContent className="w-72" align={align}>
        {children}
      </PopoverContent>
    </Popover>
  );
}
