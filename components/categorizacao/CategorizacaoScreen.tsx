"use client";

import { useEffect, useState } from "react";
import { useCategorias } from "@/components/shared/CategoriasProvider";
import { IndicatorLine } from "@/components/shared/IndicatorBar";
import type { FornecedorComVariacoes } from "@/lib/types";
import { ArvoreCategorias } from "./ArvoreCategorias";
import { CategoriaModal, type EstadoModalCategoria } from "./CategoriaModal";
import { ExcluirCategoriaModal, type AlvoExclusao } from "./ExcluirCategoriaModal";
import { ExcluirFornecedorModal } from "./ExcluirFornecedorModal";
import { FornecedorModal, type EstadoModalFornecedor } from "./FornecedorModal";
import { MesclarFornecedoresModal } from "./MesclarFornecedoresModal";
import { SubcategoriaModal, type EstadoModalSubcategoria } from "./SubcategoriaModal";
import { TabelaFornecedores } from "./TabelaFornecedores";

export function CategorizacaoScreen() {
  const { categorias, subcategorias, recarregar } = useCategorias();
  const [fornecedores, setFornecedores] = useState<FornecedorComVariacoes[]>([]);
  const [busca, setBusca] = useState("");

  const [modalCategoria, setModalCategoria] = useState<EstadoModalCategoria>(null);
  const [modalSubcategoria, setModalSubcategoria] = useState<EstadoModalSubcategoria>(null);
  const [alvoExclusao, setAlvoExclusao] = useState<AlvoExclusao>(null);
  const [modalFornecedor, setModalFornecedor] = useState<EstadoModalFornecedor>(null);
  const [fornecedorParaMesclar, setFornecedorParaMesclar] =
    useState<FornecedorComVariacoes | null>(null);
  const [fornecedorParaExcluir, setFornecedorParaExcluir] =
    useState<FornecedorComVariacoes | null>(null);

  async function carregarFornecedores() {
    const params = busca ? `?q=${encodeURIComponent(busca)}` : "";
    const res = await fetch(`/api/fornecedores${params}`);
    setFornecedores(await res.json());
  }

  useEffect(() => {
    carregarFornecedores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Categorização</h1>
      <div className="mt-1">
        <IndicatorLine
          itens={[
            { chave: "categorias", label: "categorias", valor: categorias.length },
            { chave: "subcategorias", label: "subcategorias", valor: subcategorias.length },
            { chave: "fornecedores", label: "fornecedores", valor: fornecedores.length },
          ]}
        />
      </div>

      <div className="mt-4">
        <ArvoreCategorias
          categorias={categorias}
          subcategorias={subcategorias}
          onNovaCategoria={() => setModalCategoria({ modo: "novo" })}
          onEditarCategoria={(c) => setModalCategoria({ modo: "editar", categoria: c })}
          onExcluirCategoria={(c) =>
            setAlvoExclusao({ tipo: "categoria", id: c.id, nome: c.nome })
          }
          onNovaSubcategoria={(categoriaId) =>
            setModalSubcategoria({ modo: "novo", categoriaId })
          }
          onEditarSubcategoria={(s) =>
            setModalSubcategoria({ modo: "editar", subcategoria: s })
          }
          onExcluirSubcategoria={(s) =>
            setAlvoExclusao({ tipo: "subcategoria", id: s.id, nome: s.nome })
          }
        />
      </div>

      <TabelaFornecedores
        fornecedores={fornecedores}
        busca={busca}
        onBuscaChange={setBusca}
        onNovo={() => setModalFornecedor({ modo: "novo" })}
        onEditar={(f) => setModalFornecedor({ modo: "editar", fornecedor: f })}
        onMesclar={setFornecedorParaMesclar}
        onExcluir={setFornecedorParaExcluir}
      />

      <CategoriaModal
        estado={modalCategoria}
        onClose={() => setModalCategoria(null)}
        onSalvo={recarregar}
      />
      <SubcategoriaModal
        estado={modalSubcategoria}
        onClose={() => setModalSubcategoria(null)}
        onSalvo={recarregar}
      />
      <ExcluirCategoriaModal
        alvo={alvoExclusao}
        onClose={() => setAlvoExclusao(null)}
        onExcluido={() => {
          recarregar();
          carregarFornecedores();
        }}
      />

      <FornecedorModal
        estado={modalFornecedor}
        onClose={() => setModalFornecedor(null)}
        onSalvo={carregarFornecedores}
      />
      <MesclarFornecedoresModal
        principal={fornecedorParaMesclar}
        fornecedores={fornecedores}
        onClose={() => setFornecedorParaMesclar(null)}
        onMesclado={carregarFornecedores}
      />
      <ExcluirFornecedorModal
        fornecedor={fornecedorParaExcluir}
        onClose={() => setFornecedorParaExcluir(null)}
        onExcluido={carregarFornecedores}
      />
    </div>
  );
}
