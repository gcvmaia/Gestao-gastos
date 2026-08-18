import type { InferSelectModel } from "drizzle-orm";
import type * as schema from "./db/schema";

export type Categoria = InferSelectModel<typeof schema.categorias>;
export type Subcategoria = InferSelectModel<typeof schema.subcategorias>;
export type Fornecedor = InferSelectModel<typeof schema.fornecedores>;
export type FornecedorVariacao = InferSelectModel<
  typeof schema.fornecedorVariacoes
>;
export type ExtratoImportacao = InferSelectModel<
  typeof schema.extratoImportacoes
>;
export type ExtratoTransacao = InferSelectModel<
  typeof schema.extratoTransacoes
>;

export type FornecedorComVariacoes = Fornecedor & {
  variacoes: FornecedorVariacao[];
  transacoesVinculadas: number;
};

export type SubcategoriaComCategoria = Subcategoria & {
  categoria: Pick<Categoria, "id" | "nome" | "cor">;
};

/** Transação com os dados de fornecedor/categoria/subcategoria já resolvidos, pra exibição na tabela. */
export type TransacaoExpandida = ExtratoTransacao & {
  fornecedor: Pick<Fornecedor, "id" | "nome"> | null;
  categoria: Pick<Categoria, "id" | "nome" | "cor"> | null;
  subcategoria: Pick<Subcategoria, "id" | "nome" | "icone"> | null;
};

export type TransacaoProposta = {
  data: string;
  descricaoBruta: string;
  /** null quando é moeda estrangeira sem cotação resolvida ainda — cliente completa antes de confirmar. */
  valor: number | null;
  moedaOriginal: string | null;
  valorOriginal: number | null;
  possivelDuplicado: boolean;
  fornecedorId: string | null;
  categoriaId: string | null;
  subcategoriaId: string | null;
  status: "pendente" | "sugerida";
  origemSugestao: "exata" | "parcial" | null;
};

/** Payload enviado por transação ao confirmar a importação — `valor` já resolvido. */
export type TransacaoParaConfirmar = Omit<TransacaoProposta, "valor"> & {
  valor: number;
  cotacaoUsada: number | null;
};

export type MoedaDetectada = {
  moeda: string;
  cotacaoSugerida: number | null;
};

export type PreviewImportacao = {
  nomeArquivo: string;
  identificadorArquivo: string;
  arquivoJaImportado: { data: string } | null;
  transacoesPropostas: TransacaoProposta[];
  moedasDetectadas: MoedaDetectada[];
  mapeamentoNecessario: { cabecalhos: string[]; linhasAmostra: string[][] } | null;
  erro: string | null;
};
