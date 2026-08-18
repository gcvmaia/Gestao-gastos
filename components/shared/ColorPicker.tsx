"use client";

import { Check } from "lucide-react";
import { PALETA_CORES_CATEGORIA } from "@/lib/constants";

export function ColorPicker({
  valor,
  onChange,
}: {
  valor: string;
  onChange: (cor: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {PALETA_CORES_CATEGORIA.map((cor) => {
        const ativo = valor.toLowerCase() === cor.toLowerCase();
        return (
          <button
            key={cor}
            type="button"
            onClick={() => onChange(cor)}
            aria-label={cor}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-transform"
            style={{
              backgroundColor: cor,
              outline: ativo ? "2px solid var(--foreground)" : undefined,
              outlineOffset: 2,
            }}
          >
            {ativo ? <Check className="h-4 w-4 text-white" /> : null}
          </button>
        );
      })}
    </div>
  );
}
