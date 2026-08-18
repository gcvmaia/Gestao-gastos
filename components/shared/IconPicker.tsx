"use client";

import { ICONES_SUBCATEGORIA } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { DynamicIcon } from "./DynamicIcon";

export function IconPicker({
  valor,
  onChange,
}: {
  valor: string;
  onChange: (icone: string) => void;
}) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {ICONES_SUBCATEGORIA.map((nome) => {
        const ativo = valor === nome;
        return (
          <button
            key={nome}
            type="button"
            onClick={() => onChange(nome)}
            aria-label={nome}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg border",
              ativo
                ? "border-primary bg-primary/10 text-primary"
                : "border-border-strong text-muted-foreground hover:bg-muted"
            )}
          >
            <DynamicIcon name={nome} className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
