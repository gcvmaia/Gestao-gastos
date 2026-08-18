/**
 * Cotação de câmbio via AwesomeAPI (economia.awesomeapi.com.br), gratuita e
 * sem chave. Isolado aqui pra trocar de provedor fácil se necessário.
 * Se a busca falhar (offline, API fora do ar), retorna null — o campo de
 * cotação no preview de importação fica em branco pra preenchimento manual,
 * sem bloquear a importação (ver telas/interface-extrato.md).
 */
export async function buscarCotacao(moeda: string): Promise<number | null> {
  const par = `${moeda.toUpperCase()}-BRL`;
  const chave = `${moeda.toUpperCase()}BRL`;

  try {
    const res = await fetch(
      `https://economia.awesomeapi.com.br/json/last/${par}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return null;

    const data = (await res.json()) as Record<string, { bid?: string }>;
    const bid = data?.[chave]?.bid;
    if (!bid) return null;

    const valor = Number.parseFloat(bid);
    return Number.isFinite(valor) ? valor : null;
  } catch {
    return null;
  }
}
