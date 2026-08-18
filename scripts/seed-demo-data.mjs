// Popula a aplicação com dados fictícios pra demonstração/teste — usando a
// própria API do app (import de CSV, categorização, confirmação), não
// escrita direta no banco. Requer o servidor de dev rodando.
//
// Uso: npm run seed:demo
// (opcional: SEED_BASE_URL=http://localhost:3001 npm run seed:demo)

const BASE = process.env.SEED_BASE_URL ?? "http://localhost:3000";

async function api(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${options.method ?? "GET"} ${path} -> ${res.status}: ${body}`);
  }
  return res.status === 204 ? null : res.json();
}

async function verificarServidor() {
  try {
    await api("/api/categorias");
  } catch {
    console.error(
      `Não consegui conectar em ${BASE}. Rode "npm run dev" em outro terminal antes de popular os dados (ou ajuste SEED_BASE_URL se a porta for outra).`
    );
    process.exit(1);
  }
}

async function limparBase() {
  console.log("Limpando dados existentes...");
  const importacoes = await api("/api/importacoes");
  for (const imp of importacoes) {
    await api(`/api/importacoes/${imp.id}`, { method: "DELETE" });
  }
  const fornecedores = await api("/api/fornecedores");
  for (const f of fornecedores) {
    await api(`/api/fornecedores/${f.id}`, { method: "DELETE" });
  }
  const categorias = await api("/api/categorias");
  for (const c of categorias) {
    if (c.protegida) continue;
    await api(`/api/categorias/${c.id}`, { method: "DELETE" });
  }
}

const CATEGORIAS = [
  {
    nome: "Alimentação",
    cor: "#DC2626",
    subs: [
      { nome: "Supermercado", icone: "ShoppingCart" },
      { nome: "Restaurante", icone: "Utensils" },
      { nome: "Delivery", icone: "Coffee" },
    ],
  },
  {
    nome: "Transporte",
    cor: "#2563EB",
    subs: [
      { nome: "Combustível", icone: "Fuel" },
      { nome: "App de Transporte", icone: "Car" },
    ],
  },
  {
    nome: "Moradia",
    cor: "#EA580C",
    subs: [
      { nome: "Aluguel", icone: "Home" },
      { nome: "Condomínio", icone: "Wrench" },
      { nome: "Energia", icone: "Lightbulb" },
      { nome: "Internet", icone: "Wifi" },
    ],
  },
  {
    nome: "Lazer",
    cor: "#7C3AED",
    subs: [
      { nome: "Streaming", icone: "Music" },
      { nome: "Cinema", icone: "Film" },
      { nome: "Viagem", icone: "Plane" },
    ],
  },
  {
    nome: "Saúde",
    cor: "#DB2777",
    subs: [
      { nome: "Farmácia", icone: "Pill" },
      { nome: "Plano de Saúde", icone: "Stethoscope" },
    ],
  },
  {
    nome: "Assinaturas",
    cor: "#0891B2",
    subs: [
      { nome: "Academia", icone: "Heart" },
      { nome: "Softwares", icone: "CreditCard" },
    ],
  },
  {
    nome: "Renda",
    cor: "#1D9E75",
    subs: [
      { nome: "Salário", icone: "PiggyBank" },
      { nome: "Freelance", icone: "Landmark" },
    ],
  },
];

// Fornecedores "calibrados" antes do import (nome + variações de texto
// conhecidas) — assim o motor de matching já sugere a maior parte das
// transações assim que o extrato é importado. "CVC Viagens" e "Cliente
// Freelance" ficam de fora de propósito, pra sobrar transação "Pendente"
// de verdade pra explorar o fluxo de categorização manual.
const FORNECEDORES = [
  { nome: "Supermercado Extra", categoria: "Alimentação", sub: "Supermercado", variacoes: ["SUPERMERCADO EXTRA", "EXTRA HIPERMERCADOS SA", "EXTRA SUPERMERCADO 245"] },
  { nome: "Sabor Caseiro", categoria: "Alimentação", sub: "Restaurante", variacoes: ["REST SABOR CASEIRO", "SABOR CASEIRO RESTAURANTE"] },
  { nome: "iFood", categoria: "Alimentação", sub: "Delivery", variacoes: ["IFOOD*IFOOD", "IFD*IFOOD.COM", "IFOOD.COM.BR"] },
  { nome: "Posto Ipiranga", categoria: "Transporte", sub: "Combustível", variacoes: ["AUTO POSTO IPIRANGA 12", "IPIRANGA COMBUSTIVEIS", "POSTO IPIRANGA BR"] },
  { nome: "Uber", categoria: "Transporte", sub: "App de Transporte", variacoes: ["UBER *TRIP HELP.UBER.COM", "UBER TRIP HELP.UBER.COM", "UBER *TRIP", "UBER* TRIP"] },
  { nome: "Imobiliária Central", categoria: "Moradia", sub: "Aluguel", variacoes: ["ALUGUEL IMOB CENTRAL", "IMOBILIARIA CENTRAL LTDA"] },
  { nome: "Condomínio Ed. Aurora", categoria: "Moradia", sub: "Condomínio", variacoes: ["COND ED AURORA", "CONDOMINIO EDIFICIO AURORA"] },
  { nome: "CPFL Energia", categoria: "Moradia", sub: "Energia", variacoes: ["CPFL ENERGIA", "CPFL DISTRIBUICAO SA"] },
  { nome: "Vivo Fibra", categoria: "Moradia", sub: "Internet", variacoes: ["TELEFONICA VIVO FIBRA", "VIVO FIBRA INTERNET", "TELEFONICA VIVO"] },
  { nome: "Netflix", categoria: "Lazer", sub: "Streaming", variacoes: ["NETFLIX.COM", "NETFLIX COM"] },
  { nome: "Spotify", categoria: "Lazer", sub: "Streaming", variacoes: ["SPOTIFY AB", "SPOTIFY"] },
  { nome: "Cinemark", categoria: "Lazer", sub: "Cinema", variacoes: ["CINEMARK SHOPPING", "CINEMARK BRASIL"] },
  { nome: "Farmácia São João", categoria: "Saúde", sub: "Farmácia", variacoes: ["DROGARIA SAO JOAO 88", "FARMACIA SAO JOAO"] },
  { nome: "Amil Saúde", categoria: "Saúde", sub: "Plano de Saúde", variacoes: ["AMIL ASSISTENCIA MEDICA", "AMIL SAUDE"] },
  { nome: "SmartFit", categoria: "Assinaturas", sub: "Academia", variacoes: ["SMARTFIT ACADEMIA", "SMART FIT ACADEMIA", "SMARTFIT AC"] },
  { nome: "Adobe", categoria: "Assinaturas", sub: "Softwares", variacoes: ["ADOBE SYSTEMS", "ADOBE INC"] },
  { nome: "Empresa XYZ Tech", categoria: "Renda", sub: "Salário", variacoes: ["FOLHA PGTO XYZ TECH LTDA"] },
];

// Transações por mês, como (dia do mês, descrição, valor) — os 3 meses são
// sempre calculados em relação à data em que o script roda (2 meses
// fechados/totalmente revisados + o mês corrente, parcial e parcialmente
// revisado), então o dataset nunca fica "no passado" conforme o tempo passa.
const TEMPLATE_MES = [
  [1, "COMPRA SUPERMERCADO EXTRA", -320.5],
  [3, "UBER *TRIP HELP.UBER.COM", -18.9],
  [4, "IFOOD*IFOOD", -52.3],
  [5, "FOLHA PGTO XYZ TECH LTDA", 6200.0],
  [6, "ALUGUEL IMOB CENTRAL", -1800.0],
  [6, "COND ED AURORA", -450.0],
  [7, "REST SABOR CASEIRO", -89.0],
  [8, "SMARTFIT ACADEMIA", -129.9],
  [9, "AUTO POSTO IPIRANGA 12", -180.0],
  [10, "CPFL ENERGIA", -195.4],
  [11, "UBER TRIP HELP.UBER.COM", -24.5],
  [12, "TELEFONICA VIVO FIBRA", -99.9],
  [13, "DROGARIA SAO JOAO 88", -45.6],
  [14, "EXTRA SUPERMERCADO 245", -210.0],
  [15, "NETFLIX.COM", -44.9],
  [15, "SPOTIFY AB", -21.9],
  [16, "CVC LOJA 32", -2200.0],
  [16, "IFD*IFOOD.COM", -38.7],
  [17, "UBER *TRIP", -15.2],
  [18, "ADOBE SYSTEMS", -120.0],
  [19, "CINEMARK SHOPPING", -68.0],
  [20, "AMIL ASSISTENCIA MEDICA", -450.0],
  [22, "SUPERMERCADO EXTRA", -275.9],
  [23, "IFOOD.COM.BR", -47.0],
  [24, "UBER TRIP HELP.UBER.COM", -19.8],
  [25, "PIX RECEBIDO JOAO CLIENTE", 950.0],
  [26, "SABOR CASEIRO RESTAURANTE", -102.5],
  [28, "POSTO IPIRANGA BR", -165.0],
  [29, "IFOOD*IFOOD", -41.2],
];

// mês do meio: pequenas variações nos valores/descrições pra não ficar
// idêntico ao template base
const TEMPLATE_MES_VARIACAO = [
  [1, "EXTRA HIPERMERCADOS SA", -298.0],
  [2, "UBER *TRIP", -21.0],
  [3, "IFD*IFOOD.COM", -55.9],
  [5, "FOLHA PGTO XYZ TECH LTDA", 6200.0],
  [6, "IMOBILIARIA CENTRAL LTDA", -1800.0],
  [6, "CONDOMINIO EDIFICIO AURORA", -450.0],
  [7, "REST SABOR CASEIRO", -95.4],
  [8, "SMART FIT ACADEMIA", -129.9],
  [9, "IPIRANGA COMBUSTIVEIS", -210.0],
  [10, "CPFL DISTRIBUICAO SA", -205.7],
  [11, "UBER TRIP HELP.UBER.COM", -27.4],
  [12, "VIVO FIBRA INTERNET", -99.9],
  [13, "FARMACIA SAO JOAO", -62.3],
  [14, "SUPERMERCADO EXTRA", -340.1],
  [15, "NETFLIX COM", -44.9],
  [15, "SPOTIFY", -21.9],
  [16, "IFOOD*IFOOD", -49.9],
  [17, "UBER* TRIP", -16.7],
  [18, "ADOBE INC", -120.0],
  [20, "AMIL SAUDE", -450.0],
  [21, "CINEMARK BRASIL", -72.0],
  [22, "EXTRA SUPERMERCADO 245", -260.8],
  [23, "IFOOD.COM.BR", -44.3],
  [24, "UBER *TRIP", -22.1],
  [25, "TRANSF FREELA CLIENTE A", 1200.0],
  [27, "SABOR CASEIRO RESTAURANTE", -110.0],
  [28, "AUTO POSTO IPIRANGA 12", -178.5],
  [30, "IFD*IFOOD.COM", -58.6],
];

function formatarDataBR(date) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${date.getFullYear()}`;
}

function formatarDataISO(date) {
  return date.toISOString().slice(0, 10);
}

function construirMeses() {
  const hoje = new Date();
  const diaHoje = hoje.getDate();

  function dataDoMes(offsetMeses, dia) {
    return new Date(hoje.getFullYear(), hoje.getMonth() + offsetMeses, dia);
  }

  const mesFechado1 = TEMPLATE_MES.map(([dia, desc, valor]) => [formatarDataBR(dataDoMes(-2, dia)), desc, valor]);
  const mesFechado2 = TEMPLATE_MES_VARIACAO.map(([dia, desc, valor]) => [formatarDataBR(dataDoMes(-1, dia)), desc, valor]);

  // mês corrente: só dias que já passaram, sem transação "no futuro"
  const mesCorrente = TEMPLATE_MES.filter(([dia]) => dia <= diaHoje).map(([dia, desc, valor]) => [
    formatarDataBR(dataDoMes(0, dia)),
    desc,
    valor,
  ]);

  const cortesConfirmacao = {
    fechado1: null, // confirma tudo
    fechado2: null,
    corrente: formatarDataISO(dataDoMes(0, Math.max(1, diaHoje - 5))), // confirma só até ~5 dias atrás
  };

  return [
    { nome: `extrato_${rotuloMes(dataDoMes(-2, 1))}.csv`, linhas: mesFechado1, confirmarAte: cortesConfirmacao.fechado1 },
    { nome: `extrato_${rotuloMes(dataDoMes(-1, 1))}.csv`, linhas: mesFechado2, confirmarAte: cortesConfirmacao.fechado2 },
    { nome: `extrato_${rotuloMes(dataDoMes(0, 1))}.csv`, linhas: mesCorrente, confirmarAte: cortesConfirmacao.corrente },
  ];
}

function rotuloMes(date) {
  return date.toISOString().slice(0, 7); // yyyy-mm
}

function paraCsv(linhas) {
  const cabecalho = "Data,Histórico,Valor";
  const corpo = linhas.map((l) => l.join(",")).join("\n");
  return `${cabecalho}\n${corpo}\n`;
}

async function main() {
  await verificarServidor();
  await limparBase();

  console.log("Criando categorias/subcategorias...");
  const categoriaIdPorNome = {};
  const subcategoriaIdPorChave = {};
  for (const cat of CATEGORIAS) {
    const criada = await api("/api/categorias", {
      method: "POST",
      body: JSON.stringify({ nome: cat.nome, cor: cat.cor }),
    });
    categoriaIdPorNome[cat.nome] = criada.id;
    for (const sub of cat.subs) {
      const subCriada = await api("/api/subcategorias", {
        method: "POST",
        body: JSON.stringify({ categoriaId: criada.id, nome: sub.nome, icone: sub.icone }),
      });
      subcategoriaIdPorChave[`${cat.nome}::${sub.nome}`] = subCriada.id;
    }
  }

  console.log("Criando fornecedores calibrados...");
  for (const f of FORNECEDORES) {
    await api("/api/fornecedores", {
      method: "POST",
      body: JSON.stringify({
        nome: f.nome,
        categoriaId: categoriaIdPorNome[f.categoria],
        subcategoriaId: subcategoriaIdPorChave[`${f.categoria}::${f.sub}`],
        variacoes: f.variacoes,
      }),
    });
  }

  for (const mes of construirMeses()) {
    if (mes.linhas.length === 0) continue;

    console.log(`Importando ${mes.nome}...`);
    const csv = paraCsv(mes.linhas);
    const form = new FormData();
    form.append("arquivo", new Blob([csv], { type: "text/csv" }), mes.nome);

    const previewRes = await fetch(`${BASE}/api/importacoes/preview`, { method: "POST", body: form });
    if (!previewRes.ok) {
      throw new Error(`preview ${mes.nome} -> ${previewRes.status}: ${await previewRes.text()}`);
    }
    const preview = await previewRes.json();
    if (preview.erro || preview.mapeamentoNecessario) {
      throw new Error(`preview ${mes.nome} falhou: ${JSON.stringify(preview)}`);
    }

    const transacoes = preview.transacoesPropostas.map((t) => ({ ...t, cotacaoUsada: null }));
    const importacao = await api("/api/importacoes", {
      method: "POST",
      body: JSON.stringify({
        nomeArquivo: preview.nomeArquivo,
        identificadorArquivo: preview.identificadorArquivo,
        transacoes,
      }),
    });

    const salvas = await api(`/api/transacoes?importacaoId=${importacao.id}`);
    const sugeridas = salvas.filter((t) => t.status === "sugerida");
    const aConfirmar = mes.confirmarAte ? sugeridas.filter((t) => t.data <= mes.confirmarAte) : sugeridas;

    console.log(`  ${salvas.length} transações, confirmando ${aConfirmar.length}...`);
    for (const t of aConfirmar) {
      await api(`/api/transacoes/${t.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "confirmada" }),
      });
    }
  }

  console.log("Dados de demonstração prontos.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
