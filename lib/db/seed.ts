import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

export const CATEGORIA_OUTROS_NOME = "Outros";
export const SUBCATEGORIA_OUTRO_NOME = "Outro";
const COR_PADRAO_OUTROS = "#64748B"; // cinza neutro, fora da paleta de cores selecionáveis
const ICONE_PADRAO_OUTRO = "MoreHorizontal";

// Idempotente: roda a cada boot, mas só grava se a categoria protegida ainda não existir.
export function seed(db: BetterSQLite3Database<typeof schema>) {
  const existente = db
    .select()
    .from(schema.categorias)
    .where(eq(schema.categorias.protegida, true))
    .get();

  if (existente) return;

  const categoriaId = randomUUID();
  const subcategoriaId = randomUUID();

  db.transaction((tx) => {
    tx.insert(schema.categorias)
      .values({
        id: categoriaId,
        nome: CATEGORIA_OUTROS_NOME,
        cor: COR_PADRAO_OUTROS,
        protegida: true,
      })
      .run();

    tx.insert(schema.subcategorias)
      .values({
        id: subcategoriaId,
        categoriaId,
        nome: SUBCATEGORIA_OUTRO_NOME,
        icone: ICONE_PADRAO_OUTRO,
        protegida: true,
      })
      .run();
  });
}
