import { cn } from "@/lib/utils";

/**
 * Container de card padrão do app (ver layout.md "Decisões de Estilo
 * Confirmadas"): fundo próprio + borda visível + radius 12px. `destaque`
 * troca pra fundo sólido verde profundo com texto branco (card/chip de
 * métrica principal), sem borda.
 */
export function Surface({
  className,
  destaque = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { destaque?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl p-4",
        destaque
          ? "text-white"
          : "border border-border-strong bg-surface-2",
        className
      )}
      style={destaque ? { backgroundColor: "#0F3D30" } : undefined}
      {...props}
    />
  );
}
