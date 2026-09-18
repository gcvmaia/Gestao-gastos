# Gestão de Gastos

Dashboard financeiro pessoal para acompanhar e gerir gastos a partir de
extratos bancários (CSV/XLS/XLSX): importa o extrato, categoriza as
transações — com reconhecimento automático de fornecedor — e mostra um
resumo visual de para onde o dinheiro está indo.

Roda de forma local, direto na sua máquina, sem servidor remoto e sem
autenticação: os dados são guardados com SQLite, um banco de dados leve
que salva tudo em um único arquivo no seu computador.

---

## O que o projeto faz

O app tem 3 telas:

**Extrato**
- Import de extrato bancário em CSV ou XLS/XLSX, com preview editável antes
  de confirmar
- Suporta os dois formatos comuns de coluna de valor: valor único assinado,
  ou crédito/débito separados
- Detecção de transações em moeda estrangeira, com busca automática de
  cotação (editável) e conversão pra BRL
- Aviso (não bloqueante) quando o mesmo arquivo já foi importado antes, ou
  quando uma transação parece duplicada
- Categorização em massa (seleção múltipla) ou individual
- **Reconhecimento automático de fornecedor**: ao categorizar uma
  transação, o texto bruto do extrato fica associado àquele fornecedor —
  da próxima vez que aparecer (nesse ou em extratos futuros), a
  transação já chega sugerida
- Histórico de importações, com opção de remover uma importação inteira

**Categorização**
- Árvore de categorias e subcategorias, com cor e ícone customizáveis
- Catálogo de fornecedores — criado organicamente ao categorizar no
  Extrato, ou cadastrado diretamente aqui (útil pra calibrar o
  reconhecimento automático antes de importar)
- Edição, mesclagem e exclusão de fornecedores

**Resumo**
- Indicadores de receita, saldo e gasto total do período
- Gráfico de rosca por categoria, com drill-down pra subcategoria
- Gráfico de gasto por mês
- Tabela categoria/subcategoria com % do total e dia da semana de maior gasto
- Texto de análise gerado localmente (sem IA externa): maior categoria de
  gasto, dia da semana com mais gasto, comparação com o mês anterior
- Só considera transações já confirmadas — com aviso de transparência
  quando há transações pendentes/sugeridas fora do cálculo

---

## Stack técnica

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- SQLite via [Drizzle ORM](https://orm.drizzle.team) + `better-sqlite3`
- Tailwind CSS + [shadcn/ui](https://ui.shadcn.com) (sobre [Base UI](https://base-ui.com))
- `papaparse` (CSV) e `exceljs` (XLS/XLSX) para parsing de extrato
- `recharts` para os gráficos
- Cotação de câmbio via [AwesomeAPI](https://docs.awesomeapi.com.br/api-de-moedas) (gratuita, sem chave)

## Estrutura

```
app/
  page.tsx           # shell: sidebar + navegação entre as 3 telas
  api/                # rotas de API (categorias, fornecedores, transações, resumo...)
components/
  extrato/            # tela de Extrato
  categorizacao/       # tela de Categorização
  resumo/             # tela de Resumo
  shared/              # componentes reusados entre telas (filtros, badges, modais...)
  ui/                  # componentes shadcn/ui
lib/
  db/                  # schema Drizzle, client, seed
  parsers/             # parsing de CSV/XLSX e detecção de colunas
  fornecedores/        # motor de correspondência e aprendizado de fornecedor
  resumo/             # agregações e texto de análise
drizzle/               # migrations SQL
scripts/
  seed-demo-data.mjs    # popula a app com dados fictícios via API (npm run seed:demo)
```

## Como rodar localmente

Pré-requisito: Node.js 20+.

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`. O banco SQLite (`data/gestao-gastos.db`) é
criado e migrado automaticamente no primeiro boot, já com a categoria
protegida "Outros" cadastrada — mas sem nenhuma transação, ou seja, o
app abre "do zero", vazio.

### Rodar com dados de exemplo (recomendado pra demonstração)

Com o servidor já rodando (`npm run dev`), num outro terminal:

```bash
npm run seed:demo
```

Isso popula o app com categorias, fornecedores calibrados e ~75
transações fictícias cobrindo os últimos 3 meses — os dois meses
anteriores já totalmente confirmados, e o mês corrente parcialmente
revisado (com transações pendentes/sugeridas de propósito, pra dar pra
explorar os fluxos de categorização). Recarregue a página depois de
rodar o comando.

### Rodar sem dados de exemplo

Simplesmente **não rode** o `npm run seed:demo` — o app já abre vazio
por padrão (só com a categoria "Outros"), pronto pra você importar seu
próprio extrato bancário.

## Observação

Os dados usados na demonstração (`npm run seed:demo`) são inteiramente
fictícios, gerados só pra fins de teste e guardados no banco SQLite
local — não são dados financeiros reais.
