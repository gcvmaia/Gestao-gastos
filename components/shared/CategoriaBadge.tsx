/** "Categoria · Subcategoria" numa coluna só, com cor da categoria (ver layout.md v2). */
export function CategoriaBadge({
  categoria,
  subcategoria,
}: {
  categoria: { nome: string; cor: string } | null;
  subcategoria: { nome: string } | null;
}) {
  if (!categoria) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-surface-2 px-2.5 py-1 text-xs whitespace-nowrap">
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: categoria.cor }}
      />
      {categoria.nome}
      {subcategoria ? (
        <span className="text-muted-foreground">· {subcategoria.nome}</span>
      ) : null}
    </span>
  );
}
