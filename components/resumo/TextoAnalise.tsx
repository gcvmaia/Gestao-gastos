import { Surface } from "@/components/shared/Surface";

export function TextoAnalise({ texto }: { texto: string }) {
  return (
    <Surface>
      <h2 className="mb-2 text-sm font-medium">Análise</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">{texto}</p>
    </Surface>
  );
}
