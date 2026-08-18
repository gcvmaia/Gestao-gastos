/** Linha de texto simples (sem card/borda) — ex: "X confirmadas · Y sugeridas". */
export function IndicatorLine({
  itens,
}: {
  itens: { chave: string; label: string; valor: number | string; onClick?: () => void }[];
}) {
  return (
    <p className="text-sm text-muted-foreground">
      {itens.map((item, i) => (
        <span key={item.chave}>
          {i > 0 && " · "}
          {item.onClick ? (
            <button
              type="button"
              onClick={item.onClick}
              className="underline-offset-2 hover:text-foreground hover:underline"
            >
              {item.valor} {item.label}
            </button>
          ) : (
            <span>
              {item.valor} {item.label}
            </span>
          )}
        </span>
      ))}
    </p>
  );
}

/**
 * Barra única de indicadores (ver layout.md v2): métricas de apoio como
 * texto lado a lado, métrica "herói" com chip de fundo sólido no fim.
 */
export function IndicatorHeroBar({
  itens,
  destaque,
}: {
  itens: { chave: string; label: string; valor: string }[];
  destaque: { label: string; valor: string };
}) {
  return (
    <div className="flex items-stretch overflow-hidden rounded-xl border border-border-strong bg-surface-2">
      <div className="flex flex-1 flex-wrap items-center divide-x divide-border-strong">
        {itens.map((item) => (
          <div
            key={item.chave}
            className="flex flex-1 flex-col justify-center px-4 py-3"
          >
            <span className="text-xs text-muted-foreground">{item.label}</span>
            <span className="text-lg font-semibold">{item.valor}</span>
          </div>
        ))}
      </div>
      <div
        className="flex flex-col justify-center px-4 py-3 text-white"
        style={{ backgroundColor: "#0F3D30" }}
      >
        <span className="text-xs text-white/70">{destaque.label}</span>
        <span className="text-lg font-semibold">{destaque.valor}</span>
      </div>
    </div>
  );
}
