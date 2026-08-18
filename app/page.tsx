"use client";

import { useState } from "react";
import { CategorizacaoScreen } from "@/components/categorizacao/CategorizacaoScreen";
import { ExtratoScreen } from "@/components/extrato/ExtratoScreen";
import { ResumoScreen } from "@/components/resumo/ResumoScreen";
import { CategoriasProvider } from "@/components/shared/CategoriasProvider";
import { Sidebar, type Tela } from "@/components/shell/Sidebar";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tela>("extrato");

  return (
    <CategoriasProvider>
      <Sidebar ativo={activeTab} onSelect={setActiveTab} />
      <main className="ml-14 min-h-screen px-6 py-6">
        {activeTab === "extrato" ? (
          <ExtratoScreen />
        ) : activeTab === "categorizacao" ? (
          <CategorizacaoScreen />
        ) : (
          <ResumoScreen />
        )}
      </main>
    </CategoriasProvider>
  );
}
