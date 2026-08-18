"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ModalShell } from "@/components/shared/ModalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MapeamentoColunas } from "@/lib/parsers/colunas";
import type {
  PreviewImportacao,
  TransacaoParaConfirmar,
  TransacaoProposta,
} from "@/lib/types";

const formatadorMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

type Fase = "carregando" | "mapeamento" | "preview" | "erro";

export function ImportModal({
  arquivo,
  onClose,
  onImportado,
}: {
  arquivo: File | null;
  onClose: () => void;
  onImportado: () => void;
}) {
  const [fase, setFase] = useState<Fase>("carregando");
  const [erro, setErro] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewImportacao | null>(null);
  const [cotacoesEditadas, setCotacoesEditadas] = useState<Record<string, string>>({});
  const [confirmando, setConfirmando] = useState(false);

  const [modoValor, setModoValor] = useState<"unico" | "creditoDebito">("unico");
  const [mapa, setMapa] = useState<{
    data: number | null;
    descricao: number | null;
    valor: number | null;
    credito: number | null;
    debito: number | null;
  }>({ data: null, descricao: null, valor: null, credito: null, debito: null });

  useEffect(() => {
    if (arquivo) {
      carregarPreview();
    } else {
      setFase("carregando");
      setPreview(null);
      setErro(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arquivo]);

  async function carregarPreview(mapeamento?: MapeamentoColunas) {
    if (!arquivo) return;
    setFase("carregando");
    setErro(null);

    const formData = new FormData();
    formData.append("arquivo", arquivo);
    if (mapeamento) formData.append("mapeamento", JSON.stringify(mapeamento));

    try {
      const res = await fetch("/api/importacoes/preview", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setErro((data as { erro?: string }).erro ?? "Erro ao processar o arquivo.");
        setFase("erro");
        return;
      }

      const previewData = data as PreviewImportacao;
      if (previewData.erro) {
        setErro(previewData.erro);
        setFase("erro");
        return;
      }

      if (previewData.mapeamentoNecessario) {
        setPreview(previewData);
        setFase("mapeamento");
        return;
      }

      setPreview(previewData);
      const cotacoesIniciais: Record<string, string> = {};
      for (const m of previewData.moedasDetectadas) {
        cotacoesIniciais[m.moeda] = m.cotacaoSugerida !== null ? String(m.cotacaoSugerida) : "";
      }
      setCotacoesEditadas(cotacoesIniciais);
      setFase("preview");
    } catch {
      setErro("Não foi possível conectar ao servidor.");
      setFase("erro");
    }
  }

  function valorFinal(linha: TransacaoProposta): number | null {
    if (!linha.moedaOriginal) return linha.valor;
    const cotacaoStr = cotacoesEditadas[linha.moedaOriginal];
    const cotacao = cotacaoStr ? Number.parseFloat(cotacaoStr) : NaN;
    if (!Number.isFinite(cotacao) || linha.valorOriginal === null) return null;
    return linha.valorOriginal * cotacao;
  }

  function fechar() {
    setFase("carregando");
    setPreview(null);
    setErro(null);
    setMapa({ data: null, descricao: null, valor: null, credito: null, debito: null });
    onClose();
  }

  function submeterMapeamento() {
    if (mapa.data === null || mapa.descricao === null) return;
    if (modoValor === "unico" && mapa.valor === null) return;
    if (modoValor === "creditoDebito" && mapa.credito === null && mapa.debito === null) return;

    carregarPreview({
      data: mapa.data,
      descricao: mapa.descricao,
      valor: modoValor === "unico" ? mapa.valor : null,
      credito: modoValor === "creditoDebito" ? mapa.credito : null,
      debito: modoValor === "creditoDebito" ? mapa.debito : null,
    });
  }

  async function confirmar() {
    if (!preview) return;
    setConfirmando(true);
    try {
      const transacoes: TransacaoParaConfirmar[] = preview.transacoesPropostas.map(
        (t) => {
          const vf = valorFinal(t);
          const cotacaoUsada = t.moedaOriginal
            ? Number.parseFloat(cotacoesEditadas[t.moedaOriginal])
            : null;
          return {
            ...t,
            valor: vf as number,
            cotacaoUsada: cotacaoUsada !== null && Number.isFinite(cotacaoUsada) ? cotacaoUsada : null,
          };
        }
      );

      const res = await fetch("/api/importacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeArquivo: preview.nomeArquivo,
          identificadorArquivo: preview.identificadorArquivo,
          transacoes,
        }),
      });
      if (!res.ok) throw new Error();

      toast.success(`Importação confirmada — ${transacoes.length} transações.`);
      onImportado();
      fechar();
    } catch {
      toast.error("Erro ao confirmar importação.");
    } finally {
      setConfirmando(false);
    }
  }

  const todasResolvidas =
    preview?.transacoesPropostas.every((t) => valorFinal(t) !== null) ?? false;

  return (
    <ModalShell
      aberto={arquivo !== null}
      onOpenChange={(aberto) => {
        if (!aberto) fechar();
      }}
      titulo={`Confirmar importação — ${arquivo?.name ?? ""}`}
      largura="sm:max-w-3xl"
      footer={
        fase === "preview" ? (
          <>
            <Button variant="outline" onClick={fechar} disabled={confirmando}>
              Cancelar
            </Button>
            <Button onClick={confirmar} disabled={!todasResolvidas || confirmando}>
              Confirmar importação
            </Button>
          </>
        ) : fase === "mapeamento" ? (
          <>
            <Button variant="outline" onClick={fechar}>
              Cancelar
            </Button>
            <Button onClick={submeterMapeamento}>Continuar</Button>
          </>
        ) : (
          <Button variant="outline" onClick={fechar}>
            Fechar
          </Button>
        )
      }
    >
      {fase === "carregando" ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Processando arquivo...</p>
      ) : null}

      {fase === "erro" ? (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{erro}</p>
      ) : null}

      {fase === "mapeamento" && preview?.mapeamentoNecessario ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Não conseguimos identificar as colunas automaticamente. Indique qual coluna
            corresponde a cada campo.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <CampoSelect
              label="Data *"
              cabecalhos={preview.mapeamentoNecessario.cabecalhos}
              valor={mapa.data}
              onChange={(v) => setMapa((m) => ({ ...m, data: v }))}
            />
            <CampoSelect
              label="Descrição *"
              cabecalhos={preview.mapeamentoNecessario.cabecalhos}
              valor={mapa.descricao}
              onChange={(v) => setMapa((m) => ({ ...m, descricao: v }))}
            />
          </div>

          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={modoValor === "unico"}
                onChange={() => setModoValor("unico")}
              />
              Coluna de valor único (sinal indica gasto/receita)
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={modoValor === "creditoDebito"}
                onChange={() => setModoValor("creditoDebito")}
              />
              Colunas separadas de Crédito/Débito
            </label>
          </div>

          {modoValor === "unico" ? (
            <CampoSelect
              label="Valor *"
              cabecalhos={preview.mapeamentoNecessario.cabecalhos}
              valor={mapa.valor}
              onChange={(v) => setMapa((m) => ({ ...m, valor: v }))}
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <CampoSelect
                label="Crédito"
                cabecalhos={preview.mapeamentoNecessario.cabecalhos}
                valor={mapa.credito}
                onChange={(v) => setMapa((m) => ({ ...m, credito: v }))}
              />
              <CampoSelect
                label="Débito"
                cabecalhos={preview.mapeamentoNecessario.cabecalhos}
                valor={mapa.debito}
                onChange={(v) => setMapa((m) => ({ ...m, debito: v }))}
              />
            </div>
          )}
        </div>
      ) : null}

      {fase === "preview" && preview ? (
        <div className="space-y-4">
          {preview.arquivoJaImportado ? (
            <p className="rounded-md bg-amber-100 p-3 text-sm text-amber-900">
              Este arquivo já foi importado em{" "}
              {new Date(preview.arquivoJaImportado.data).toLocaleString("pt-BR")}. Você
              pode prosseguir mesmo assim.
            </p>
          ) : null}

          {preview.moedasDetectadas.length > 0 ? (
            <div className="space-y-2 rounded-md border border-border-strong p-3">
              <p className="text-sm font-medium">Cotações de câmbio</p>
              {preview.moedasDetectadas.map((m) => (
                <div key={m.moeda} className="flex items-center gap-2 text-sm">
                  <Label className="w-32 shrink-0">1 {m.moeda} =</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    className="h-8 w-32"
                    value={cotacoesEditadas[m.moeda] ?? ""}
                    onChange={(e) =>
                      setCotacoesEditadas((c) => ({ ...c, [m.moeda]: e.target.value }))
                    }
                    placeholder={m.cotacaoSugerida === null ? "sem conexão — preencha" : undefined}
                  />
                  <span className="text-muted-foreground">BRL</span>
                </div>
              ))}
            </div>
          ) : null}

          <div className="max-h-80 overflow-y-auto rounded-md border border-border-strong">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface-2">
                <tr className="border-b border-border-strong text-left text-xs text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Data</th>
                  <th className="px-3 py-2 font-medium">Descrição</th>
                  <th className="px-3 py-2 font-medium text-right">Valor</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {preview.transacoesPropostas.map((t, i) => {
                  const vf = valorFinal(t);
                  return (
                    <tr key={i} className="border-b border-border-strong last:border-0">
                      <td className="px-3 py-1.5 whitespace-nowrap">{t.data}</td>
                      <td className="max-w-[220px] truncate px-3 py-1.5">
                        {t.descricaoBruta}
                        {t.possivelDuplicado ? (
                          <span className="ml-1.5 rounded bg-amber-100 px-1 text-[10px] text-amber-900">
                            possível duplicado
                          </span>
                        ) : null}
                      </td>
                      <td className="px-3 py-1.5 text-right whitespace-nowrap">
                        {vf !== null ? formatadorMoeda.format(vf) : "—"}
                      </td>
                      <td className="px-3 py-1.5 text-xs text-muted-foreground capitalize">
                        {t.status}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </ModalShell>
  );
}

function CampoSelect({
  label,
  cabecalhos,
  valor,
  onChange,
}: {
  label: string;
  cabecalhos: string[];
  valor: number | null;
  onChange: (valor: number | null) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <select
        className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm"
        value={valor ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      >
        <option value="">Selecione...</option>
        {cabecalhos.map((c, i) => (
          <option key={i} value={i}>
            {c || `Coluna ${i + 1}`}
          </option>
        ))}
      </select>
    </div>
  );
}
