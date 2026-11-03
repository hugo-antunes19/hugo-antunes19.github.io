import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Background, Controls, Handle, MiniMap, Position, ReactFlow,
  useEdgesState, useNodesState, type Edge, type Node, type NodeProps,
} from '@xyflow/react';
import { Activity, Check, Database, Play, Square, Table2 } from 'lucide-react';
import '@xyflow/react/dist/style.css';

type LineageProps = { projectId: string; engineer: boolean };
type Layer = 'Bronze' | 'Silver' | 'Gold' | 'Service';
type FlowNode = Node<{ title: string; subtitle: string; layer: Layer; detail: string; columns?: string[] }, 'lineage'>;

const layerColor: Record<Layer, string> = { Bronze: '#CD7F32', Silver: '#94A3B8', Gold: '#F59E0B', Service: '#58a6ff' };
const baseNodeStyle = { background: '#161b22', border: '1px solid #21262d', color: '#e6edf3', borderRadius: 10, padding: 11, width: 180, fontSize: 12 };

function LineageNode({ data, selected }: NodeProps<FlowNode>) {
  const Icon = data.columns ? Table2 : data.layer === 'Service' ? Activity : Database;
  return <div style={{ ...baseNodeStyle, borderColor: selected ? '#58a6ff' : layerColor[data.layer], boxShadow: selected ? '0 0 0 2px #58a6ff44' : undefined }}>
    <Handle type="target" position={Position.Left} style={{ background: layerColor[data.layer], border: 0, width: 7, height: 7 }} />
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon size={15} color={layerColor[data.layer]} />
      <span style={{ fontWeight: 650 }}>{data.title}</span><span style={{ marginLeft: 'auto', color: layerColor[data.layer], fontSize: 10 }}>{data.layer}</span></div>
    {data.columns ? <div style={{ color: '#8b949e', margin: '7px 0 0 23px', lineHeight: 1.35, fontSize: 9 }}>{data.columns.map((column) => <div key={column}>{column}</div>)}</div> : <div style={{ color: '#8b949e', margin: '7px 0 0 23px', lineHeight: 1.4 }}>{data.subtitle}</div>}
    <Handle type="source" position={Position.Right} style={{ background: layerColor[data.layer], border: 0, width: 7, height: 7 }} />
  </div>;
}
const nodeTypes = { lineage: LineageNode };

const projectFlows: Record<string, { nodes: FlowNode[]; edges: Edge[] }> = {
  documents: {
    nodes: [
      { id: 'source', type: 'lineage', position: { x: 0, y: 0 }, data: { title: 'Fontes', subtitle: 'Documentos e dados', layer: 'Bronze', detail: 'Fontes de documentos e dados. Etapas e camadas são um mapeamento ilustrativo, sem afirmar que Bronze/Silver/Gold sejam usados na implementação.' } },
      { id: 'ocr', type: 'lineage', position: { x: 200, y: 0 }, data: { title: 'OCR · Mistral', subtitle: 'Extração de conteúdo', layer: 'Silver', detail: 'Mistral é usado para OCR. A associação à camada Silver é apenas ilustrativa.' } },
      { id: 'lakehouse', type: 'lineage', position: { x: 0, y: 150 }, data: { title: 'Databricks', subtitle: 'Processamento de dados', layer: 'Gold', detail: 'Databricks participa do processamento de dados. A associação à camada Gold é apenas ilustrativa.' } },
      { id: 'api', type: 'lineage', position: { x: 200, y: 150 }, data: { title: 'Foundry APIs', subtitle: 'Integração e consumo', layer: 'Service', detail: 'APIs do Foundry ilustram a integração entre fontes e processamento.' } },
      { id: 'compliance', type: 'lineage', position: { x: 0, y: 300 }, data: { title: 'Compliance', subtitle: 'Requisitos do domínio', layer: 'Service', detail: 'Compliance é requisito do domínio representado neste fluxo conceitual.' } },
    ], edges: [['source','ocr'],['ocr','lakehouse'],['lakehouse','api'],['api','compliance']].map(([source,target], i) => ({ id: `doc-${i}`, source, target, type: 'smoothstep', style: { stroke: '#484f58' } })),
  },
  infra: {
    nodes: [
      { id: 'config', type: 'lineage', position: { x: 0, y: 0 }, data: { title: 'Infraestrutura', subtitle: 'Configuração declarativa', layer: 'Bronze', detail: 'Configuração de infraestrutura ilustrada conceitualmente; a associação Bronze é apenas visual.' } },
      { id: 'terragrunt', type: 'lineage', position: { x: 200, y: 0 }, data: { title: 'Terragrunt', subtitle: 'Orquestração IaC', layer: 'Silver', detail: 'Terragrunt organiza a configuração IaC. A associação Silver é apenas visual.' } },
      { id: 'terraform', type: 'lineage', position: { x: 0, y: 150 }, data: { title: 'Terraform', subtitle: 'Infraestrutura como código', layer: 'Gold', detail: 'Terraform é usado para infraestrutura como código. A associação Gold é apenas visual.' } },
    ], edges: [['config','terragrunt'],['terragrunt','terraform']].map(([source,target], i) => ({ id: `infra-${i}`, source, target, type: 'smoothstep', style: { stroke: '#484f58' } })),
  },
  observe: {
    nodes: [
      { id: 'services', type: 'lineage', position: { x: 0, y: 0 }, data: { title: 'Sinais', subtitle: 'Dados de observabilidade', layer: 'Bronze', detail: 'Sinais de observabilidade representados conceitualmente. A associação Bronze é apenas visual.' } },
      { id: 'datadog', type: 'lineage', position: { x: 200, y: 0 }, data: { title: 'Datadog', subtitle: 'Observabilidade', layer: 'Silver', detail: 'Datadog é a plataforma de observabilidade indicada. Não se presume uma arquitetura específica de coleta.' } },
      { id: 'insights', type: 'lineage', position: { x: 0, y: 150 }, data: { title: 'Observabilidade', subtitle: 'Consulta e acompanhamento', layer: 'Gold', detail: 'Consulta e acompanhamento de sinais em Datadog, representados conceitualmente.' } },
    ], edges: [['services','datadog'],['datadog','insights']].map(([source,target], i) => ({ id: `obs-${i}`, source, target, type: 'smoothstep', style: { stroke: '#484f58' } })),
  },
  vision: {
    nodes: [
      { id: 'video', type: 'lineage', position: { x: 0, y: 0 }, data: { title: 'Vídeo de partida', subtitle: 'Maracanã', layer: 'Bronze', detail: 'Vídeo associado ao projeto Maracanomali.' } },
      { id: 'frames', type: 'lineage', position: { x: 200, y: 0 }, data: { title: 'Preparação visual', subtitle: 'Frames para análise', layer: 'Silver', detail: 'Preparação conceitual dos dados visuais para análise.' } },
      { id: 'autoencoder', type: 'lineage', position: { x: 0, y: 150 }, data: { title: 'Autoencoder', subtitle: 'Modelo de vídeo', layer: 'Gold', detail: 'Autoencoder para análise de vídeo no projeto Maracanomali.' } },
      { id: 'moments', type: 'lineage', position: { x: 200, y: 150 }, data: { title: 'Análise', subtitle: 'Maracanomali', layer: 'Service', detail: 'Resultado conceitual da análise associada ao projeto.' } },
    ], edges: [['video','frames'],['frames','autoencoder'],['autoencoder','moments']].map(([source,target], i) => ({ id: `vision-${i}`, source, target, type: 'smoothstep', style: { stroke: '#484f58' } })),
  },
};

const erdFlow: { nodes: FlowNode[]; edges: Edge[] } = {
  nodes: [
    { id: 'bronze-projects', type: 'lineage', position: { x: 0, y: 0 }, data: { title: 'bronze.projects', subtitle: '', layer: 'Bronze', columns: ['id · title · category · tagline', 'description · contribution · outcome', 'stack VARCHAR[] · access · url', 'professional BOOLEAN'], detail: 'Esquema conceitual local de bronze.projects. Campos de projetos como definidos neste portfólio.' } },
    { id: 'silver-projects', type: 'lineage', position: { x: 200, y: 0 }, data: { title: 'silver.projects', subtitle: '', layer: 'Silver', columns: ['id · title · category · tagline', 'description · contribution · outcome', 'stack VARCHAR[] · access · url', 'professional BOOLEAN'], detail: 'Esquema conceitual local de silver.projects, com as mesmas colunas do registro de projeto.' } },
    { id: 'gold-projects', type: 'lineage', position: { x: 0, y: 175 }, data: { title: 'gold.projects', subtitle: '', layer: 'Gold', columns: ['id · title · category · tagline', 'description · contribution · outcome', 'stack VARCHAR[] · access · url', 'professional BOOLEAN'], detail: 'Esquema conceitual local de gold.projects, com as mesmas colunas do registro de projeto.' } },
    { id: 'gold-technologies', type: 'lineage', position: { x: 200, y: 175 }, data: { title: 'gold.technologies', subtitle: '', layer: 'Gold', columns: ['project_id · technology'], detail: 'Tabela gold.technologies associada a gold.projects por gold.projects.id → gold.technologies.project_id.' } },
  ], edges: [
    { id: 'bronze-silver', source: 'bronze-projects', target: 'silver-projects', label: 'transforma', type: 'smoothstep', style: { stroke: '#484f58' }, labelStyle: { fill: '#8b949e', fontSize: 10 } },
    { id: 'silver-gold', source: 'silver-projects', target: 'gold-projects', label: 'transforma', type: 'smoothstep', style: { stroke: '#484f58' }, labelStyle: { fill: '#8b949e', fontSize: 10 } },
    { id: 'project-tech', source: 'gold-projects', target: 'gold-technologies', label: 'id → project_id', type: 'smoothstep', style: { stroke: '#484f58' }, labelStyle: { fill: '#8b949e', fontSize: 10 } },
  ],
};

const cardStyle = { border: '1px solid #21262d', background: '#0d1117', color: '#e6edf3', borderRadius: 12 } as const;

export default function Lineage({ projectId, engineer }: LineageProps) {
  const [view, setView] = useState<'dag' | 'erd'>('dag');
  const activeView = engineer ? view : 'dag';
  const flow = activeView === 'erd' ? erdFlow : projectFlows[projectId] ?? projectFlows.documents;
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>(flow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flow.edges);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(-1);
  const [flowKey, setFlowKey] = useState(0);
  const selected = nodes.find((node) => node.id === selectedId);

  useEffect(() => { if (!engineer) setView('dag'); }, [engineer]);

  useEffect(() => {
    setNodes(flow.nodes.map((node) => ({ ...node, data: { ...node.data } })));
    setEdges(flow.edges.map((edge) => ({ ...edge })));
    setSelectedId(null); setRunning(false); setStep(-1); setFlowKey((key) => key + 1);
  }, [flow, projectId, activeView, setEdges, setNodes]);

  const [reducedMotion, setReducedMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!running) return;
    if (step >= nodes.length - 1) { setRunning(false); return; }
    const timer = window.setTimeout(() => setStep((current) => current + 1), 700);
    return () => window.clearTimeout(timer);
  }, [running, step, nodes.length]);

  useEffect(() => () => setRunning(false), [projectId]);

  const displayNodes = useMemo(() => nodes.map((node, index) => ({ ...node, style: { ...node.style, borderColor: step >= index && running ? '#3fb950' : node.style?.borderColor, boxShadow: !reducedMotion && step === index && running ? '0 0 18px #3fb95066' : node.style?.boxShadow } })), [nodes, reducedMotion, running, step]);
  const displayEdges = useMemo(() => edges.map((edge) => ({ ...edge, animated: running && !reducedMotion })), [edges, reducedMotion, running]);
  const onSelectionChange = useCallback(({ nodes: picked }: { nodes: FlowNode[] }) => setSelectedId(picked[0]?.id ?? null), []);
  const simulate = () => { setStep(-1); setRunning(true); };

  return <section style={{ ...cardStyle, padding: 16, marginTop: 18, overflow: 'hidden' }} aria-label="Linhas de dados do projeto">
    <header style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
      <div style={{ flex: '1 1 220px' }}><div style={{ fontWeight: 700, fontSize: 14 }}>Linhas de dados</div><div style={{ color: '#8b949e', fontSize: 11, marginTop: 3 }}>Fluxo conceitual · nós arrastáveis</div></div>
      {engineer && <div style={{ display: 'flex', gap: 6 }}>
        {(['dag', 'erd'] as const).map((mode) => <button key={mode} aria-pressed={activeView === mode} onClick={() => setView(mode)} style={{ border: `1px solid ${activeView === mode ? '#58a6ff' : '#30363d'}`, background: activeView === mode ? '#1f3a5a' : '#161b22', color: '#e6edf3', borderRadius: 7, padding: '6px 10px', cursor: 'pointer', fontSize: 11 }}>{mode.toUpperCase()}</button>)}
      </div>}
      <button onClick={running ? () => setRunning(false) : simulate} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid #30363d', background: '#161b22', color: '#e6edf3', borderRadius: 7, padding: '6px 10px', cursor: 'pointer', fontSize: 11 }}>
        {running ? <Square size={13} /> : <Play size={13} />}{running ? 'Parar' : 'Simular'}
      </button>
    </header>
    <div style={{ color: '#d29922', fontSize: 10, letterSpacing: '.06em', fontWeight: 700, marginBottom: 5 }}>SIMULAÇÃO · NÃO É EXECUÇÃO DE PRODUÇÃO</div>
    <div style={{ color: '#8b949e', fontSize: 10, marginBottom: 8 }}>{activeView === 'dag' ? 'Bronze / Silver / Gold são mapeamentos ilustrativos; não indicam camadas confirmadas da arquitetura.' : 'Esquema conceitual das tabelas locais do portfólio.'}</div>
    <div style={{ height: 360, width: '100%', minWidth: 0, border: '1px solid #21262d', borderRadius: 10, overflow: 'hidden' }}>
      <ReactFlow key={flowKey} nodes={displayNodes} edges={displayEdges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onSelectionChange={onSelectionChange} fitView fitViewOptions={{ padding: 0.12, minZoom: 0.3, maxZoom: 1.5 }} minZoom={0.25} maxZoom={1.5} style={{ background: '#0d1117' }}>
        <Background color="#21262d" gap={20} size={1} /><MiniMap nodeColor={(node) => layerColor[(node.data as FlowNode['data']).layer]} maskColor="#0d111799" style={{ background: '#161b22' }} /><Controls />
      </ReactFlow>
    </div>
    <footer style={{ display: 'flex', gap: 14, flexWrap: 'wrap', margin: '10px 2px 0', color: '#8b949e', fontSize: 10 }}>
      {(['Bronze', 'Silver', 'Gold'] as Layer[]).map((layer) => <span key={layer} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><i style={{ width: 8, height: 8, borderRadius: 8, background: layerColor[layer] }} />{layer}</span>)}
      {activeView === 'erd' && <span>ERD conceitual · gold.projects.id → gold.technologies.project_id</span>}
    </footer>
    {selected && <aside style={{ ...cardStyle, marginTop: 12, padding: 12, borderColor: '#30363d' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#e6edf3', fontWeight: 650, fontSize: 12 }}>{step >= nodes.findIndex((node) => node.id === selected.id) && running ? <Check size={14} color="#3fb950" /> : <Database size={14} color={layerColor[selected.data.layer]} />}{selected.data.title}<span style={{ color: layerColor[selected.data.layer], fontSize: 10, fontWeight: 500 }}>{selected.data.layer}</span></div>
      <div style={{ color: '#8b949e', fontSize: 11, lineHeight: 1.5, marginTop: 6 }}>{selected.data.detail}</div>
    </aside>}
  </section>;
}
