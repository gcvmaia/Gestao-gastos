import { createHash } from "node:crypto";

/** Hash SHA-256 do conteúdo de um arquivo — usado para detectar reimportação. */
export function hashArrayBuffer(buffer: ArrayBuffer): string {
  return createHash("sha256").update(Buffer.from(buffer)).digest("hex");
}
