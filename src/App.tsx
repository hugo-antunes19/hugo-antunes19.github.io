import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Activity, ArrowDown, ArrowUpRight, Blocks, Braces, ChevronDown, ChevronRight, CircleHelp, Code2, Database, ExternalLink, FileJson, Filter, Gauge, GitBranch, Layers, LoaderCircle, Maximize2, Play, RotateCcw, Search, Server, ShieldCheck, SquareTerminal, Table2, Terminal, Workflow, Zap } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import catalog from '../public/data/projects.json';
import demo from '../public/data/pipeline-demo.json';
import { filterQuery } from './query-policy.mjs';
import type { EngineStatus, Project, QueryMetric, QueryResult } from './types';

const StreamingCanvas = lazy(() => import('./StreamingCanvas'));
const Lineage = lazy(() => import('./Lineage'));
const projects: Project[] = catalog;
const categories = ['Todos', 'Infraestrutura', 'Observabilidade', 'IA & ETL', 'Visão computacional'];
const examples = [
  { label: 'Projetos', sql: filterQuery('Todos') },
  { label: 'Stack & SQL', sql: 'SELECT technology, count(*) AS projects\nFROM gold.technologies\nGROUP BY technology ORDER BY projects DESC, technology;' },
  { label: 'Join', sql: "SELECT p.title, t.technology\nFROM gold.projects p\nJOIN gold.technologies t ON p.id = t.project_id\nWHERE t.technology IN ('Python', 'Databricks', 'Terraform');" },
  { label: 'Qualidade demo', sql: "SELECT stage, count(*) AS batches,\n  round(avg(records)) AS avg_records,\n  round(avg(latency_ms), 1) AS avg_latency_ms\nFROM demo.pipeline_events\nGROUP BY stage ORDER BY avg_records DESC;" },
  { label: 'EXPLAIN', sql: 'EXPLAIN ANALYZE SELECT category, count(*)\nFROM gold.projects GROUP BY category;' },
];
const fmt = (value: unknown): string => {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'object') { try { return JSON.stringify(value, (_, v) => typeof v === 'bigint' ? String(v) : v); } catch { return String(value); } }
  return String(value);
};

function SQL({ code }: { code: string }) {
  return <code>{code.split(/(\b(?:SELECT|FROM|WHERE|ORDER BY|DESC|GROUP BY|JOIN|ON|AS|IN|EXPLAIN|ANALYZE|WITH|LIMIT)\b|'[^']*')/gi).map((token, i) => <span key={i} className={/^'/.test(token) ? 'sql-string' : /^(SELECT|FROM|WHERE|ORDER BY|DESC|GROUP BY|JOIN|ON|AS|IN|EXPLAIN|ANALYZE|WITH|LIMIT)$/i.test(token) ? 'sql-keyword' : ''}>{token}</span>)}</code>;
}

function ProjectCard({ project, selected, onSelect, bytes }: { project: Project; selected: boolean; onSelect: () => void; bytes: number }) {
  const Icon = project.id === 'documents' ? FileJson : project.id === 'infra' ? Blocks : project.id === 'observe' ? Activity : Search;
  return <motion.article layout className={`project-card group ${selected ? 'selected' : ''}`}>
    <button className="project-select" onClick={onSelect} aria-pressed={selected} aria-label={`Explorar ${project.title}`}>
      <div className="flex items-center justify-between gap-3"><span className="project-icon"><Icon size={19} /></span><span className="type-tag">{project.professional ? 'PROFISSIONAL' : 'OPEN SOURCE'}</span></div>
      <h3>{project.title}</h3><p>{project.tagline}</p>
      <div className="tech-tags">{project.stack.slice(0, 3).map(tech => <span key={tech}>{tech}</span>)}{project.stack.length > 3 && <span>+{project.stack.length - 3}</span>}</div>
      <div className="project-card-foot"><span className="mono"><i />gold.projects</span><ArrowUpRight size={16} /></div>
    </button>
    <div className="table-metadata" role="note"><span className="metadata-heading"><Table2 size={13} /> TABLE METADATA</span><dl><dt>Registro / catálogo</dt><dd>1 / {projects.length} rows</dd><dt>Arquivo fonte</dt><dd>JSON · {(bytes / 1024).toFixed(1)} KB</dd><dt>Partição física</dt><dd>nenhuma · in-memory</dd><dt>Chave</dt><dd>id = '{project.id}'</dd><dt>Schema</dt><dd>id VARCHAR · stack VARCHAR[]</dd><dt>Plano conceitual</dt><dd>scan → filter(id)</dd></dl></div>
  </motion.article>;
}

function Telemetry({ metrics }: { metrics: QueryMetric[] }) {
  const [batch, setBatch] = useState(12);
  const [playing, setPlaying] = useState(false);
  const [compute, setCompute] = useState(2);
  const reduced = useReducedMotion();
  useEffect(() => { if (!playing) return; const timer = window.setInterval(() => setBatch(n => n >= 24 ? (setPlaying(false), 24) : n + 1), 950); return () => clearInterval(timer); }, [playing]);
  const points = Array.from({ length: batch }, (_, i) => Object.fromEntries([['batch', i + 1], ...['bronze', 'silver', 'gold'].map(stage => [stage, demo.find(row => row.batch === i + 1 && row.stage === stage)!.records])])) as { batch: number; bronze: number; silver: number; gold: number }[];
  const costs = [1, 2, 4, 8].map(units => ({ compute: units, relativeCost: units * 12, latency: Math.round(680 / Math.sqrt(units)) }));
  return <section id="observabilidade" className="section-block"><div className="section-title"><div><span className="eyebrow">03 / OBSERVABILITY</span><h2>Signals, not guesswork<span>.</span></h2></div><span className="demo-badge"><CircleHelp size={12} /> DEMONSTRAÇÃO DIDÁTICA</span></div>
    <div className="telemetry-grid"><div className="panel chart-panel"><div className="panel-header"><span><Activity size={15} /> Medallion throughput</span><button className="icon-button" aria-label={playing ? 'Pausar simulação' : 'Executar simulação de throughput'} onClick={() => { if (batch === 24) setBatch(1); setPlaying(!playing); }}>{playing ? 'Ⅱ' : <Play size={13} />}</button></div><div className="chart-legend"><span className="bronze-text">● Bronze</span><span className="silver-text">● Silver</span><span className="gold-text">● Gold</span><span className="chart-unit">registros / lote</span></div><div className="chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={points} margin={{ top: 15, right: 15, left: -22, bottom: 0 }}><defs><linearGradient id="throughput" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F59E0B" stopOpacity={0.18}/><stop offset="1" stopColor="#F59E0B" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#21262d" vertical={false}/><XAxis dataKey="batch" tick={{ fill: '#7d8590', fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={20}/><YAxis tick={{ fill: '#7d8590', fontSize: 10 }} axisLine={false} tickLine={false}/><Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', fontSize: 11 }} labelFormatter={value => `Lote ${value} · simulação`} /><Area type="monotone" dataKey="bronze" stroke="#CD7F32" fill="none" strokeWidth={1.5} isAnimationActive={false}/><Area type="monotone" dataKey="silver" stroke="#94A3B8" fill="none" strokeWidth={1.5} isAnimationActive={false}/><Area type="monotone" dataKey="gold" stroke="#F59E0B" fill="url(#throughput)" strokeWidth={2} isAnimationActive={!reduced}/></AreaChart></ResponsiveContainer></div><p className="chart-note">Dataset sintético local · não são métricas dos projetos.</p></div>
      <div className="panel chart-panel"><div className="panel-header"><span><Gauge size={15} /> Query latency</span><span className="real-badge">MEDIÇÃO REAL</span></div><div className="chart-value">{metrics.length ? metrics.at(-1)!.ms.toFixed(1) : '—'}<small>ms</small><span>última consulta no seu navegador</span></div><div className="spark-chart">{metrics.length > 1 ? <ResponsiveContainer width="100%" height="100%"><LineChart data={metrics}><XAxis dataKey="n" hide/><YAxis hide domain={[0, 'auto']}/><Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', fontSize: 11 }}/><Line dataKey="ms" stroke="#10B981" strokeWidth={2} dot={false} isAnimationActive={false}/></LineChart></ResponsiveContainer> : <div className="empty-spark">Execute consultas para construir o histórico.</div>}</div><p className="chart-note">Tempo de execução + comunicação com o Web Worker.</p></div>
      <div className="panel chart-panel finops"><div className="panel-header"><span><Zap size={15} /> Compute × latency</span><span className="demo-badge">MODELO ILUSTRATIVO</span></div><div className="finops-values"><div><b>{compute}×</b><span>compute relativo</span></div><div><b>{Math.round(680 / Math.sqrt(compute))}<small>ms</small></b><span>latência estimada</span></div></div><label className="range-label">Capacidade simulada <input type="range" min="0" max="3" value={[1,2,4,8].indexOf(compute)} onChange={e => setCompute([1,2,4,8][Number(e.target.value)])} aria-label="Capacidade de compute simulada" /></label><div className="mini-cost"><span>Custo relativo</span>{costs.map(point => <span key={point.compute} className={compute === point.compute ? 'active' : ''}>{point.compute}×<i style={{ height: `${point.relativeCost / 2}px` }}/></span>)}</div><p className="chart-note">Modelo didático: t = 680 / √compute. Sem preço ou benchmark de provedor.</p></div></div>
  </section>;
}

export default function App() {
  const [mode, setMode] = useState<'executive' | 'engineer'>('executive');
  const [status, setStatus] = useState<EngineStatus>('loading');
  const [version, setVersion] = useState('');
  const [bytes, setBytes] = useState(new TextEncoder().encode(JSON.stringify(catalog)).length);
  const [category, setCategory] = useState('Todos');
  const [visibleIds, setVisibleIds] = useState(projects.map(p => p.id));
  const [selected, setSelected] = useState('documents');
  const [editor, setEditor] = useState(examples[0].sql);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [autoSQL, setAutoSQL] = useState(examples[0].sql);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState<QueryMetric[]>([]);
  const [schema, setSchema] = useState<Record<string, unknown>[]>([]);
  const [memory, setMemory] = useState<number | null>(null);
  const [schemaTable, setSchemaTable] = useState('gold.projects');
  const [explain, setExplain] = useState('');
  const queryNumber = useRef(0);
  const operation = useRef(0);
  const reduced = useReducedMotion();
  const project = projects.find(p => p.id === selected)!;

  function record(r: QueryResult) { setResult(r); setMetrics(previous => [...previous.slice(-19), { n: ++queryNumber.current, ms: Number(r.duration.toFixed(2)) }]); }
  async function initialize() {
    const op = ++operation.current;
    setStatus('loading'); setBusy(true); setError('');
    try {
      const engine = await import('./engine');
      const state = await engine.startEngine();
      const initial = await engine.runQuery(examples[0].sql);
      const columns = await engine.runQuery('DESCRIBE gold.projects;');
      if (operation.current !== op) return;
      setVersion(state.version.replace(/^v/, '')); setBytes(state.bytes); record(initial); setSchema(columns.rows);
      setSchemaTable('gold.projects'); setCategory('Todos'); setVisibleIds(projects.map(p => p.id));
      setAutoSQL(examples[0].sql); setStatus('ready');
    } catch (e) { if (operation.current === op) { setStatus('error'); setError(e instanceof Error ? e.message : String(e)); } }
    finally { if (operation.current === op) setBusy(false); }
  }
  useEffect(() => { void initialize(); }, []);
  useEffect(() => {
    const sample = () => { const p = performance as Performance & { memory?: { usedJSHeapSize: number } }; setMemory(p.memory ? p.memory.usedJSHeapSize / 1048576 : null); };
    sample(); const timer = window.setInterval(sample, 4000); return () => clearInterval(timer);
  }, []);

  async function execute(sql: string, filtered = false) {
    if (busy || status !== 'ready') return;
    const op = ++operation.current; setBusy(true); setError(''); setExplain('');
    const timer = window.setTimeout(async () => {
      if (operation.current !== op) return;
      ++operation.current; setBusy(false); setStatus('error'); setError('A consulta excedeu 10 segundos. O worker foi interrompido; reconecte o motor para continuar.');
      const engine = await import('./engine'); await engine.resetEngine();
    }, 10000);
    try {
      const engine = await import('./engine'); const r = await engine.runQuery(sql);
      if (operation.current !== op) return;
      record(r);
      if (filtered) setVisibleIds(r.rows.map(row => String(row.id)));
      if (/^EXPLAIN/i.test(sql.trim())) setExplain(r.rows.map(row => Object.values(row).map(fmt).join('\n')).join('\n'));
    } catch (e) { if (operation.current === op) setError(e instanceof Error ? e.message : String(e)); }
    finally { clearTimeout(timer); if (operation.current === op) setBusy(false); }
  }
  async function changeCategory(next: string) {
    if (status !== 'ready' || busy) return;
    const sql = filterQuery(next); setCategory(next); setAutoSQL(sql); setEditor(sql); await execute(sql, true);
  }
  async function inspectTable(table: string) {
    if (busy || status !== 'ready') return;
    const op = ++operation.current; setBusy(true); setError('');
    try {
      const engine = await import('./engine'); const r = await engine.runQuery(`DESCRIBE ${table};`);
      if (operation.current === op) { setSchemaTable(table); setSchema(r.rows); }
    } catch (e) { if (operation.current === op) setError(e instanceof Error ? e.message : String(e)); }
    finally { if (operation.current === op) setBusy(false); }
  }
  const filteredProjects = projects.filter(p => visibleIds.includes(p.id));

  return <><a className="skip" href="#main">Pular para o conteúdo</a><header className="topbar"><a href="#" className="brand"><span className="brand-icon"><Database size={19}/></span>hugo<span className="brand-dot">.</span><span className="brand-sub">data engineering</span></a><div className="persona-toggle" aria-label="Modo de visualização"><button className={mode === 'executive' ? 'active' : ''} onClick={() => setMode('executive')} aria-pressed={mode === 'executive'}><Gauge size={14}/><span>Executive</span></button><button className={mode === 'engineer' ? 'active' : ''} onClick={() => setMode('engineer')} aria-pressed={mode === 'engineer'}><Code2 size={14}/><span>SQL / Engineer</span></button></div><a className="github-link" href="https://github.com/hugo-antunes19" target="_blank" rel="noopener noreferrer"><Code2 size={17}/><span>GitHub</span><ArrowUpRight size={13}/></a></header>
    <aside className="sidebar"><div className="sidebar-label">WORKSPACE</div><a href="#main" className="sidebar-active"><Layers size={16}/><span>Overview</span></a><a href="#projetos"><Blocks size={16}/><span>Project catalog</span><small>04</small></a><a href="#lineage"><GitBranch size={16}/><span>Data lineage</span></a><a href="#observabilidade"><Activity size={16}/><span>Observability</span></a><button onClick={() => { setMode('engineer'); requestAnimationFrame(() => document.getElementById('query-lab')?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' })); }}><Terminal size={16}/><span>SQL workspace</span></button><div className="sidebar-divider"/><div className="sidebar-label">LAKEHOUSE</div>{(['bronze','silver','gold'] as const).map(layer => <button key={layer} className={`layer-link ${layer}`} onClick={() => { setMode('engineer'); if (status === 'ready') void inspectTable(`${layer}.projects`); }}><Database size={14}/><span>{layer}</span><small>01</small></button>)}<div className="sidebar-bottom"><span className="online-dot"/>Browser-local engine<br/><small>Zero backend. Your compute.</small></div></aside>
    <main id="main" className="main-shell"><div className="breadcrumb"><span>workspace</span><ChevronRight size={12}/><span>hugo_antunes</span><ChevronRight size={12}/><b>overview</b><span className="env-badge">PERSONAL LAKEHOUSE</span></div>
      <section className="hero"><div className="hero-copy"><div className="hero-eyebrow"><span className="online-dot"/> DATA & DATABASE ENGINEER</div><h1>Da origem do dado<br/>à próxima <em>decisão.</em></h1><p>Sou Hugo Antunes. Conecto infraestrutura, observabilidade e inteligência artificial para transformar informação em sistemas que fazem sentido.</p><div className="manifest"><span><span className="syntax-purple">education</span> <b>:</b> Engenharia de Computação · UFRJ</span><span><span className="syntax-purple">focus</span> <b>:</b> Data Engineering & Databases</span><span><span className="syntax-purple">runtime</span> <b>:</b> Seu navegador. SQL de verdade.</span></div><div className="hero-actions"><a href="#projetos" className="primary-button">Explore os projetos <ArrowDown size={14}/></a><button className="text-button" onClick={() => { setMode('engineer'); requestAnimationFrame(() => document.getElementById('query-lab')?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' })); }}><SquareTerminal size={15}/> Execute uma query</button></div></div><div className="hero-visual"><div className="visual-top"><span><Workflow size={13}/> INGESTION ENGINE</span><span className="mono muted">CLIENT-SIDE RENDER</span></div><Suspense fallback={<div className="canvas-fallback">BRONZE → SILVER → GOLD</div>}><StreamingCanvas/></Suspense></div></section>
      <div className="kpi-grid"><div className="kpi"><span><Blocks size={14}/>PROJECTS IN CATALOG</span><strong>04<small>projetos reais</small></strong><p>03 profissionais + 01 autoral</p></div><div className="kpi"><span><Layers size={14}/>MEDALLION LAYERS</span><strong><i className="bronze-dot"/><i className="silver-dot"/><i className="gold-dot"/>03<small>camadas locais</small></strong><p>Bronze → Silver → Gold</p></div><div className="kpi"><span><Database size={14}/>QUERY ENGINE</span><strong>DuckDB<small>WebAssembly</small></strong><p>{status === 'ready' ? `v${version} · in-memory` : status === 'loading' ? 'Inicializando motor local…' : 'Reconexão necessária'}</p></div><div className="kpi"><span><ShieldCheck size={14}/>DATA OWNERSHIP</span><strong>100%<small>client-side</small></strong><p>Consultas executadas no seu dispositivo</p></div></div>
      {error && <div role="alert" className="error-banner"><span>{error}</span>{status === 'error' && <button onClick={() => void initialize()}><RotateCcw size={13}/>Reconectar</button>}</div>}
      <section id="projetos" className="section-block"><div className="section-title"><div><span className="eyebrow">01 / CURATED PROJECTS</span><h2>Engenharia em produção<span>.</span></h2><p>Experiências profissionais e projetos autorais, organizados como um catálogo consultável.</p></div><span className="catalog-location"><Database size={13}/> gold.projects <span>4 rows</span></span></div><div className="filter-row"><span className="filter-label"><Filter size={13}/> FILTER BY</span>{categories.map(item => <button key={item} disabled={status !== 'ready' || busy} className={`filter-pill ${category === item ? 'active' : ''}`} onClick={() => void changeCategory(item)}>{item}</button>)}</div>
        <details className="query-ribbon"><summary><span><Code2 size={14}/><SQL code={autoSQL}/></span><span>{busy ? <LoaderCircle size={12} className="spin"/> : <span className="success-dot"/>}{status === 'ready' ? 'SQL REAL · DUCKDB' : 'INICIALIZANDO'}<ChevronDown size={12}/></span></summary><div>Este filtro consulta as tabelas locais no Web Worker. <button className="text-button" onClick={() => setMode('engineer')}>Abrir o SQL workspace <ArrowUpRight size={12}/></button></div></details>
        <motion.div layout className="project-grid"><AnimatePresence>{filteredProjects.map(p => <ProjectCard key={p.id} project={p} selected={selected === p.id} onSelect={() => setSelected(p.id)} bytes={bytes}/>)}</AnimatePresence>{!filteredProjects.length && <p>Nenhum projeto encontrado.</p>}</motion.div>
      </section>
      <section id="lineage" className="section-block"><div className="section-title"><div><span className="eyebrow">02 / EXPLORE THE ARCHITECTURE</span><h2>As conexões por trás do projeto<span>.</span></h2></div><span className="mono muted">DIAGRAMA CONCEITUAL</span></div><div className="project-tabs">{projects.map(p => <button className={selected === p.id ? 'active' : ''} key={p.id} onClick={() => setSelected(p.id)} aria-pressed={selected === p.id}>{p.title}</button>)}</div><div className="case-layout"><div className="case-copy panel"><span className="eyebrow">{project.category.toUpperCase()}</span><h3>{project.tagline}</h3><p>{project.description}</p><div className="case-label">MINHA CONTRIBUIÇÃO</div><p>{project.contribution}</p><div className="case-label">OBJETIVO DA SOLUÇÃO</div><p>{project.outcome}</p><div className="tech-tags">{project.stack.map(tech => <span key={tech}>{tech}</span>)}</div>{project.url ? <a className="case-link" href={project.url} target="_blank" rel="noopener noreferrer">Explorar código público <ExternalLink size={13}/></a> : <span className="case-note"><ShieldCheck size={13}/>Relato profissional · código interno não publicado</span>}</div><div className="lineage-panel panel"><Suspense fallback={<div className="loading-panel"><LoaderCircle className="spin"/>Carregando o mapa…</div>}><Lineage projectId={selected} engineer={mode === 'engineer'}/></Suspense></div></div></section>
      {mode === 'engineer' && <motion.section initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} id="query-lab" className="section-block"><div className="section-title"><div><span className="eyebrow">ENGINEER WORKSPACE</span><h2>Your browser. Your query engine<span>.</span></h2><p>SQL analítico real sobre os arquivos estáticos deste portfólio.</p></div><span className="real-badge">DUCKDB-WASM</span></div><div className="sql-workspace"><div className="schema-browser panel"><div className="panel-header"><span><Database size={14}/>Schema browser</span></div>{['bronze.projects','silver.projects','gold.projects','gold.technologies','demo.pipeline_events'].map(table => <button key={table} disabled={status !== 'ready' || busy} className={schemaTable === table ? 'active' : ''} onClick={() => void inspectTable(table)}><Table2 size={12}/>{table}</button>)}<div className="schema-columns">{schema.map((row,i) => <div key={i}><span>{fmt(row.column_name)}</span><small>{fmt(row.column_type)}</small></div>)}</div></div><div className="query-console panel"><div className="panel-header"><span><Terminal size={14}/>query.sql</span><span className="mono muted">CTRL / ⌘ + ENTER</span></div><div className="query-examples">{examples.map(example => <button key={example.label} onClick={() => setEditor(example.sql)}>{example.label}</button>)}</div><div className="editor-wrap"><span className="line-numbers" aria-hidden="true">{editor.split('\n').map((_,i) => <span key={i}>{i+1}</span>)}</span><textarea aria-label="Editor SQL" spellCheck={false} value={editor} onChange={e => setEditor(e.target.value)} onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); void execute(editor); } }}/></div><div className="editor-toolbar"><span className="mono muted">Read-only · resultados limitados a 200 linhas</span><button className="primary-button small" disabled={status !== 'ready' || busy} onClick={() => void execute(editor)}>{busy ? <LoaderCircle size={13} className="spin"/> : <Play size={13}/>}Run query</button></div><div className="result-header"><span><Table2 size={12}/>RESULTS</span><span aria-live="polite">{result ? `${result.rows.length} rows · ${result.duration.toFixed(1)} ms` : 'Aguardando consulta'}</span></div><div className="results-table" role="region" aria-label="Resultados SQL" tabIndex={0}>{result && <table><thead><tr>{result.columns.map(column => <th key={column}>{column}</th>)}</tr></thead><tbody>{result.rows.map((row,i) => <tr key={i}>{result.columns.map(column => <td key={column}>{fmt(row[column])}</td>)}</tr>)}</tbody></table>}</div>{explain && <details className="explain-panel" open><summary>EXPLAIN ANALYZE · plano real</summary><pre>{explain}</pre></details>}</div></div></motion.section>}
      <Telemetry metrics={metrics}/>
      <section id="sobre" className="about-panel panel"><div><span className="eyebrow">THE ENGINEER BEHIND THE PIPELINE</span><h2>Hugo Antunes<span>.</span></h2><p>Engenharia de Dados e Computação. Atuo entre infraestrutura como código, observabilidade e integração de dados com IA. Estudo Engenharia de Computação e Informação na UFRJ.</p><div className="tech-tags"><span>Python</span><span>SQL</span><span>Terraform</span><span>Databricks</span><span>Datadog</span></div></div><div className="contact-box"><span className="mono muted">LET'S BUILD SOMETHING MEANINGFUL</span><h3>O próximo sistema<br/>começa com uma conversa.</h3><a className="primary-button" href="https://github.com/hugo-antunes19" target="_blank" rel="noopener noreferrer"><Code2 size={15}/>Encontre-me no GitHub<ArrowUpRight size={14}/></a></div></section>
      <footer className="page-footer"><span>hugo.data / {new Date().getFullYear()}</span><span>Built like a data platform. Runs like a static site.</span><a href="#main">Voltar ao topo ↑</a></footer>
    </main><div className="statusbar" role="status"><span><span className={`status-dot ${status}`}/>{status === 'ready' ? `Connected: DuckDB-Wasm ${version} (In-Memory)` : status === 'loading' ? 'Initializing DuckDB-Wasm…' : 'Engine disconnected'}</span><span><Server size={11}/>gh-pages-edge-01 <small>identificador visual · execução local</small></span><span>JS heap: {memory === null ? 'n/d' : `${memory.toFixed(1)} MB`}</span><span>Last query: {result ? `${result.duration.toFixed(1)} ms` : '—'}</span><span className="status-end"><ShieldCheck size={11}/>Zero backend</span></div></>;
}
