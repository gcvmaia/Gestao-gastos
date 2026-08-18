"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Categoria, Subcategoria } from "@/lib/types";

type CategoriasContextValue = {
  categorias: Categoria[];
  subcategorias: Subcategoria[];
  carregando: boolean;
  recarregar: () => Promise<void>;
};

const CategoriasContext = createContext<CategoriasContextValue | null>(null);

// Evita refazer o fetch de categorias/subcategorias em toda tela — usado
// pelos filtros do Extrato, seletores dos modais e tabela do Resumo.
export function CategoriasProvider({ children }: { children: React.ReactNode }) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    const [resCategorias, resSubcategorias] = await Promise.all([
      fetch("/api/categorias"),
      fetch("/api/subcategorias"),
    ]);
    setCategorias(await resCategorias.json());
    setSubcategorias(await resSubcategorias.json());
    setCarregando(false);
  }, []);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  return (
    <CategoriasContext.Provider
      value={{ categorias, subcategorias, carregando, recarregar }}
    >
      {children}
    </CategoriasContext.Provider>
  );
}

export function useCategorias() {
  const ctx = useContext(CategoriasContext);
  if (!ctx) {
    throw new Error("useCategorias precisa estar dentro de <CategoriasProvider>");
  }
  return ctx;
}
