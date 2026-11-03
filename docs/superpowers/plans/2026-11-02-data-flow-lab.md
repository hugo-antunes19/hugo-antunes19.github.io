# Client-Side Lakehouse Implementation Plan

**Goal:** Publicar a especificação ampliada fornecida pelo usuário após a aprovação visual Data Flow Lab.
**Architecture:** Vite/React/TypeScript compilado para GitHub Pages, sem backend. DuckDB-Wasm com worker e Wasm locais, arquivos JSON estáticos, DAG/ERD React Flow, gráficos Recharts e WebGL.
**Spec:** Mensagem explícita do usuário: Interactive Client-Side Lakehouse & Query Engine Portfolio.

## Restrições

- Não inventar formação, certificações ou métricas profissionais.
- Simulações identificadas; latência de consultas e memória JS medidas quando disponíveis.
- Fontes, worker e Wasm estáticos e compatíveis com Pages.
- Fluxos profissionais conceituais; ERD corresponde ao catálogo real.

## Execução

- [x] Instalar stack e implementar catálogo Bronze/Silver/Gold local.
- [x] Implementar dois modos, REPL, filtros SQL, schema e EXPLAIN.
- [x] Implementar WebGL com fallback e DAGs com simulação explícita.
- [x] Implementar gráficos e distinguir dados reais/didáticos.
- [x] Revisão independente: limite antes da materialização e serialização da inicialização/schema corrigidos. Quatro testes passaram. Build passou. Navegador local confirmou filtros, JOIN, EXPLAIN ANALYZE, limite 200 e timeout/reconexão; celular sem overflow horizontal.
- [x] Publicado por GitHub Actions (run 41567991441). Produção conectou DuckDB 1.5.4 e executou GROUP BY no catálogo, retornando quatro categorias com uma linha cada.

## Verificação

`npm test`, `npm run build`, revisão independente, UI de Executive/Engineer, filtros e query inválida, JOIN/EXPLAIN, reconexão e visual em desktop/celular.
