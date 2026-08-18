import { sql } from "drizzle-orm";
import {
  integer,
  real,
  sqliteTable,
  text,
  index,
} from "drizzle-orm/sqlite-core";

export const categorias = sqliteTable("categorias", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  cor: text("cor").notNull(),
  protegida: integer("protegida", { mode: "boolean" })
    .notNull()
    .default(false),
});

export const subcategorias = sqliteTable(
  "subcategorias",
  {
    id: text("id").primaryKey(),
    categoriaId: text("categoria_id")
      .notNull()
      .references(() => categorias.id),
    nome: text("nome").notNull(),
    icone: text("icone").notNull(),
    protegida: integer("protegida", { mode: "boolean" })
      .notNull()
      .default(false),
  },
  (table) => [index("subcategorias_categoria_id_idx").on(table.categoriaId)]
);

export const fornecedores = sqliteTable("fornecedores", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  categoriaId: text("categoria_id").references(() => categorias.id),
  subcategoriaId: text("subcategoria_id").references(() => subcategorias.id),
});

export const fornecedorVariacoes = sqliteTable(
  "fornecedor_variacoes",
  {
    id: text("id").primaryKey(),
    fornecedorId: text("fornecedor_id")
      .notNull()
      .references(() => fornecedores.id, { onDelete: "cascade" }),
    textoBruto: text("texto_bruto").notNull(),
  },
  (table) => [
    index("fornecedor_variacoes_fornecedor_id_idx").on(table.fornecedorId),
  ]
);

export const extratoImportacoes = sqliteTable("extrato_importacoes", {
  id: text("id").primaryKey(),
  nomeArquivo: text("nome_arquivo").notNull(),
  identificadorArquivo: text("identificador_arquivo").notNull(),
  dataImportacao: text("data_importacao")
    .notNull()
    .default(sql`(current_timestamp)`),
  quantidadeTransacoes: integer("quantidade_transacoes").notNull(),
});

export const STATUS_TRANSACAO = ["pendente", "sugerida", "confirmada"] as const;
export type StatusTransacao = (typeof STATUS_TRANSACAO)[number];

export const ORIGEM_SUGESTAO = ["exata", "parcial"] as const;
export type OrigemSugestao = (typeof ORIGEM_SUGESTAO)[number];

export const extratoTransacoes = sqliteTable(
  "extrato_transacoes",
  {
    id: text("id").primaryKey(),
    importacaoId: text("importacao_id")
      .notNull()
      .references(() => extratoImportacoes.id, { onDelete: "cascade" }),
    data: text("data").notNull(),
    descricaoBruta: text("descricao_bruta").notNull(),
    valor: real("valor").notNull(),
    fornecedorId: text("fornecedor_id").references(() => fornecedores.id),
    categoriaId: text("categoria_id").references(() => categorias.id),
    subcategoriaId: text("subcategoria_id").references(
      () => subcategorias.id
    ),
    status: text("status", { enum: STATUS_TRANSACAO })
      .notNull()
      .default("pendente"),
    origemSugestao: text("origem_sugestao", { enum: ORIGEM_SUGESTAO }),
    possivelDuplicado: integer("possivel_duplicado", { mode: "boolean" })
      .notNull()
      .default(false),
    moedaOriginal: text("moeda_original"),
    valorOriginal: real("valor_original"),
    cotacaoUsada: real("cotacao_usada"),
  },
  (table) => [
    index("extrato_transacoes_importacao_id_idx").on(table.importacaoId),
    index("extrato_transacoes_status_idx").on(table.status),
    index("extrato_transacoes_fornecedor_id_idx").on(table.fornecedorId),
    index("extrato_transacoes_categoria_id_idx").on(table.categoriaId),
  ]
);
