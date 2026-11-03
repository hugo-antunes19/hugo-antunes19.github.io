# Hugo Antunes / Interactive Lakehouse

Portfólio estático de Engenharia de Dados e Computação. Vite + React + TypeScript, Tailwind, Framer Motion, Lucide, DuckDB-Wasm, React Flow, Recharts e WebGL nativo.

## Executar

Node.js 24 recomendado.

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

O build gera `dist/`. GitHub Actions compila e publica esse diretório no Pages. Não há backend, banco remoto, credenciais ou serviços pagos. Wasm e worker são distribuídos junto com o site; não dependem de um CDN para o banco.

## Banco no navegador

- `public/data/projects.json`: quatro projetos reais fornecidos por Hugo.
- `bronze.projects`: ingestão do JSON local.
- `silver.projects`: deduplicação e validação dos identificadores e títulos.
- `gold.projects`: catálogo para consumo.
- `gold.technologies`: tecnologias normalizadas por projeto.
- `public/data/pipeline-demo.json` → `demo.pipeline_events`: dados sintéticos para a demonstração de throughput.

Os filtros no laboratório técnico executam SQL no DuckDB. Esse modo oferece editor com Ctrl/Cmd+Enter, exemplos, schema browser e EXPLAIN ANALYZE real. O REPL permite consultas locais; mutações, múltiplas instruções e fontes externas são bloqueadas. Resultados exibidos limitados a 200 linhas. Um worker é interrompido após 10s de consulta e pode ser reconectado. Limite de memória SQL: 128MB. A carga do módulo Wasm é feita no navegador (aproximadamente 41MB sem compressão).

## Honestidade dos dados

Descrições profissionais são baseadas nas informações do usuário. Não há métricas de impacto inventadas, certificações não confirmadas nem dados de clientes. DAGs dos projetos são representações conceituais; não documentação de ambientes profissionais. O ERD representa as tabelas efetivamente criadas no catálogo local.

Throughput, execução do DAG e FinOps são simulações didáticas identificadas na interface. Latência SQL é medida com `performance.now()` incluindo comunicação com o worker. JS heap usa `performance.memory` quando disponível: é memória JavaScript do navegador, não memória exclusiva do DuckDB. O identificador `gh-pages-edge-01` é visual; o banco não executa em um cluster remoto.

A comparação FinOps segue t = 680 / sqrt(compute): um modelo ilustrativo, sem preços reais nem benchmark de provedor.

## Acessibilidade e compatibilidade

Controles HTML nativos, foco visível, labels, modo de movimento reduzido e fallback estático de WebGL. O canvas pausa quando a página fica oculta. Sem JavaScript, um resumo dos projetos e o GitHub continuam acessíveis. WebAssembly/Web Workers são necessários para as consultas. Falhas de inicialização mantêm o conteúdo e permitem reconectar.

## Conteúdo

- Framework Terragrunt/Terraform.
- Observabilidade de dados com Datadog.
- ETL documental: OCR, Mistral, Databricks, Foundry e APIs.
- [Maracanomali público](https://github.com/hugo-antunes19/maracanomali-public).

As fontes tipográficas do Google são opcionais e têm alternativas locais.

## Apresentação para visitantes

A página inicial prioriza textos em português, propósito dos projetos e detalhes sob demanda. Não exibe SQL, telemetria, metadados de tabelas, sidebar ou barra de status. O laboratório completo abre apenas em “Versão técnica”. O DuckDB-Wasm também só inicializa após essa escolha. A formação e as descrições continuam baseadas nas informações confirmadas do autor.
