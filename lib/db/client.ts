import path from "node:path";
import fs from "node:fs";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";
import { seed } from "./seed";

const DB_PATH = path.join(process.cwd(), "data", "gestao-gastos.db");

declare global {
  var __db__: ReturnType<typeof drizzle<typeof schema>> | undefined;
}

function createDb() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const sqlite = new Database(DB_PATH);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  seed(db);

  return db;
}

// Reusa a conexão entre hot-reloads do `next dev` (evita abrir o arquivo várias vezes).
export const db = globalThis.__db__ ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalThis.__db__ = db;
}
