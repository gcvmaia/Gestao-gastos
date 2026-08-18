"use client";

import { useEffect, useState } from "react";
import { IndicatorLine } from "@/components/shared/IndicatorBar";
import type { StatusTransacao } from "@/lib/db/schema";
import type { ExtratoImportacao, Fornecedor, TransacaoExpandida } from "@/lib/types";
import { CategorizacaoEmMassaBar } from "./CategorizacaoEmMassaBar";
import { EditarTransacaoModal } from "./EditarTransacaoModal";
import {
  FILTROS_VAZIOS,
  FiltrosExtrato,
  type FiltrosExtratoState,
} from "./FiltrosExtrato";
import { HistoricoImportacoes } from "./HistoricoImportacoes";
import { ImportModal } from "./ImportModal";
import { RemoverImportacaoModal } from "./RemoverImportacaoModal";
import { TabelaTransacoes } from "./TabelaTransacoes";

export function ExtratoScreen() {
  const [filtros, setFiltros] = useState<FiltrosExtratoState>(FILTROS_VAZIOS);
  const [transacoesTodas, setTransacoesTodas] = useState<TransacaoExpandida[]>([]);
  const [importacoes, setImportacoes] = useState<ExtratoImportacao[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());
  const [modalEdicao, setModalEdicao] = useState<TransacaoExpandida | null>(null);
  const [arquivoImportando, setArquivoImportando] = useState<File | null>(null);
  const [importacaoParaRemover, setImportacaoParaRemover] =
    useState<ExtratoImportacao | null>(null);

  async function carregarTransacoes() {
    const params = new URLSearchParams();
    if (filtros.periodoDe) params.set("periodoDe", filtros.periodoDe);
    if (filtros.periodoAte) params.set("periodoAte", filtros.periodoAte);
    if (filtros.valorMin) params.set("valorMin", filtros.valorMin);
    if (filtros.valorMax) params.set("valorMax", filtros.valorMax);
    if (filtros.categoriaIds.length)
      params.set("categoriaIds", filtros.categoriaIds.join(","));
    if (filtros.subcategoriaIds.length)
      params.set("subcategoriaIds", filtros.subcategoriaIds.join(","));
    if (filtros.fornecedorTexto) params.set("fornecedor", filtros.fornecedorTexto);

    const res = await fetch(`/api/transacoes?${params.toString()}`);
    setTransacoesTodas(await res.json());
  }

  async function carregarImportacoes() {
    const res = await fetch("/api/importacoes");
    setImportacoes(await res.json());
  }

  async function carregarFornecedores() {
    const res = await fetch("/api/fornecedores");
    setFornecedores(await res.json());
  }

  async function recarregarTudo() {
    await Promise.all([
      carregarTransacoes(),
      carregarImportacoes(),
      carregarFornecedores(),
    ]);
  }

  useEffect(() => {
    carregarImportacoes();
    carregarFornecedores();
  }, []);

  useEffect(() => {
    carregarTransacoes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filtros.periodoDe,
    filtros.periodoAte,
    filtros.valorMin,
    filtros.valorMax,
    filtros.categoriaIds,
    filtros.subcategoriaIds,
    filtros.fornecedorTexto,
  ]);

  // Indicadores refletem os filtros ativos (exceto status, que é o próprio
  // recorte aplicado na tabela abaixo — ver telas/interface-extrato.md).
  const transacoesFiltradas =
    filtros.status === "todos"
      ? transacoesTodas
      : transacoesTodas.filter((t) => t.status === filtros.status);

  const contagens = {
    confirmadas: transacoesTodas.filter((t) => t.status === "confirmada").length,
    sugeridas: transacoesTodas.filter((t) => t.status === "sugerida").length,
    pendentes: transacoesTodas.filter((t) => t.status === "pendente").length,
  };

  function toggleSelecao(id: string) {
    setSelecionadas((s) => {
      const novo = new Set(s);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  function toggleSelecaoTodas() {
    const todasSelecionadas = transacoesFiltradas.every((t) => selecionadas.has(t.id));
    setSelecionadas((s) => {
      const novo = new Set(s);
      for (const t of transacoesFiltradas) {
        if (todasSelecionadas) novo.delete(t.id);
        else novo.add(t.id);
      }
      return novo;
    });
  }

  async function toggleFlag(id: string, statusAtual: StatusTransacao) {
    const novoStatus = statusAtual === "sugerida" ? "confirmada" : "sugerida";
    await fetch(`/api/transacoes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: novoStatus }),
    });
    carregarTransacoes();
  }

  const idsSelecionadosNaTela = [...selecionadas].filter((id) =>
    transacoesFiltradas.some((t) => t.id === id)
  );

  return (
    <div>
      <h1 className="text-2xl font-bold">Extrato</h1>

      <div className="mt-1">
        <IndicatorLine
          itens={[
            {
              chave: "confirmadas",
              label: "confirmadas",
              valor: contagens.confirmadas,
              onClick: () => setFiltros((f) => ({ ...f, status: "confirmada" })),
            },
            {
              chave: "sugeridas",
              label: "sugeridas",
              valor: contagens.sugeridas,
              onClick: () => setFiltros((f) => ({ ...f, status: "sugerida" })),
            },
            {
              chave: "pendentes",
              label: "pendentes",
              valor: contagens.pendentes,
              onClick: () => setFiltros((f) => ({ ...f, status: "pendente" })),
            },
            {
              chave: "importados",
              label: "extratos importados",
              valor: importacoes.length,
            },
          ]}
        />
      </div>

      <div className="mt-4">
        <FiltrosExtrato
          filtros={filtros}
          onChange={setFiltros}
          fornecedores={fornecedores}
          onArquivoSelecionado={setArquivoImportando}
        />
      </div>

      <div className="mt-4">
        <TabelaTransacoes
          transacoes={transacoesFiltradas}
          selecionadas={selecionadas}
          onToggleSelecao={toggleSelecao}
          onToggleSelecaoTodas={toggleSelecaoTodas}
          onToggleFlag={toggleFlag}
          onEditar={setModalEdicao}
          temImportacao={importacoes.length > 0}
        />
      </div>

      {idsSelecionadosNaTela.length > 0 ? (
        <div className="mt-4">
          <CategorizacaoEmMassaBar
            quantidadeSelecionada={idsSelecionadosNaTela.length}
            ids={idsSelecionadosNaTela}
            fornecedores={fornecedores}
            onAplicado={() => {
              setSelecionadas(new Set());
              recarregarTudo();
            }}
            onCancelar={() => setSelecionadas(new Set())}
          />
        </div>
      ) : null}

      <HistoricoImportacoes importacoes={importacoes} onRemover={setImportacaoParaRemover} />

      <ImportModal
        arquivo={arquivoImportando}
        onClose={() => setArquivoImportando(null)}
        onImportado={recarregarTudo}
      />

      <EditarTransacaoModal
        transacao={modalEdicao}
        fornecedores={fornecedores}
        onClose={() => setModalEdicao(null)}
        onSalvo={recarregarTudo}
      />

      <RemoverImportacaoModal
        importacao={importacaoParaRemover}
        onClose={() => setImportacaoParaRemover(null)}
        onRemovido={recarregarTudo}
      />
    </div>
  );
}
