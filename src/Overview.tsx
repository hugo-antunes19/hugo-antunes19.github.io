import { ArrowDown, ArrowUpRight, Code2, Database, FileCheck2, Layers, Activity, ScanEye } from 'lucide-react';
import type { Project } from './types';

const stories: Record<string, { title: string; intro: string; challenge: string; solution: string; goal: string }> = {
  documents: {
    title: 'Conferência inteligente de documentos',
    intro: 'Ler documentos e comparar informações entre diferentes fontes.',
    challenge: 'Informações em documentos e sistemas precisam ser comparadas para verificar se estão de acordo.',
    solution: 'Desenvolvi um fluxo que lê documentos, organiza os dados e faz a conferência entre fontes.',
    goal: 'Apoiar a verificação de conformidade das informações.',
  },
  infra: {
    title: 'Uma base organizada para a infraestrutura',
    intro: 'Estruturar os recursos que sustentam os sistemas e os dados.',
    challenge: 'A infraestrutura precisa de uma forma organizada e reutilizável de ser configurada.',
    solution: 'Criei um framework que reúne definições de infraestrutura em código.',
    goal: 'Oferecer uma base comum para organizar o provisionamento dos recursos.',
  },
  observe: {
    title: 'Mais visibilidade sobre a operação de dados',
    intro: 'Entender o que acontece nos fluxos de informação.',
    challenge: 'Para investigar o comportamento de um fluxo de dados, é preciso enxergar sua operação.',
    solution: 'Trabalhei na observabilidade de dados com Datadog, apoiando o acompanhamento dos fluxos.',
    goal: 'Dar visibilidade para acompanhar e investigar a operação.',
  },
  vision: {
    title: 'Maracanomali: encontrar o inesperado',
    intro: 'Identificar situações fora do padrão em vídeos.',
    challenge: 'Como reconhecer comportamentos visuais diferentes do esperado em uma sequência de vídeo?',
    solution: 'Desenvolvi um projeto de visão computacional que analisa os frames e procura anomalias com um modelo de aprendizado de máquina.',
    goal: 'Explorar a detecção de anomalias em vídeo em tempo real.',
  },
};
const icons = { documents: FileCheck2, infra: Layers, observe: Activity, vision: ScanEye };

export default function Overview({ projects, onEngineer }: { projects: Project[]; onEngineer: () => void }) {
  return <div className="overview"><a className="skip" href="#apresentacao">Pular para o conteúdo</a>
    <header className="overview-header"><a className="overview-brand" href="#apresentacao"><Database size={22}/>hugo<span>.</span></a><nav aria-label="Navegação principal"><a href="#projetos">Projetos</a><a href="#sobre">Sobre</a><a href="#contato">Contato</a></nav><button className="overview-technical" onClick={onEngineer}><Code2 size={15}/><span>Versão técnica</span></button></header>
    <main id="apresentacao" className="overview-main">
      <section className="overview-hero"><div><p className="overview-eyebrow">HUGO ANTUNES · ENGENHARIA DE DADOS</p><h1>Transformo dados<br/>em <em>soluções.</em></h1><p className="overview-intro">Conecto informações, organizo sistemas e construo ferramentas para resolver problemas. Aqui você conhece meu trabalho e o propósito de cada projeto.</p><a className="overview-cta" href="#projetos">Conheça meus projetos <ArrowDown size={16}/></a></div><div className="overview-art" aria-hidden="true"><div className="overview-orbit orbit-one"/><div className="overview-orbit orbit-two"/><div className="overview-art-core"><Database size={45}/></div><span className="art-label art-label-one">Organizar</span><span className="art-label art-label-two">Conectar</span><span className="art-label art-label-three">Entender</span><i className="art-point point-one"/><i className="art-point point-two"/><i className="art-point point-three"/></div></section>
      <section id="projetos" className="overview-projects"><div className="overview-section-heading"><p className="overview-eyebrow">TRABALHOS SELECIONADOS</p><h2>Projetos com um propósito claro.</h2><p>Do desafio à solução, uma visão do que construí.</p></div><div className="overview-project-grid">{projects.map(project => {
        const story = stories[project.id]; const Icon = icons[project.id as keyof typeof icons];
        return <article className="overview-project" key={project.id}><div className="overview-project-top"><span className="overview-project-icon"><Icon size={23}/></span><span>{project.professional ? 'Experiência profissional' : 'Projeto autoral'}</span></div><h3>{story.title}</h3><p className="overview-project-intro">{story.intro}</p><div className="overview-purpose"><span>O que fiz</span><p>{story.solution}</p></div><details><summary>Entenda o projeto <span aria-hidden="true">+</span></summary><div className="overview-details"><h4>O desafio</h4><p>{story.challenge}</p><h4>O objetivo</h4><p>{story.goal}</p><h4>Ferramentas utilizadas</h4><p>{project.stack.join(' · ')}</p>{project.url && <a href={project.url} target="_blank" rel="noopener noreferrer">Ver o código no GitHub <ArrowUpRight size={15}/></a>}</div></details></article>;
      })}</div></section>
      <section id="sobre" className="overview-about"><div><p className="overview-eyebrow">UM POUCO SOBRE MIM</p><h2>Curiosidade para entender.<br/>Engenharia para construir.</h2></div><div><p>Sou Hugo Antunes, profissional de Engenharia de Dados e estudante de Engenharia de Computação e Informação na UFRJ.</p><p>Meu trabalho passa pela organização de infraestrutura, pelo acompanhamento de sistemas e pela leitura de documentos com inteligência artificial. Gosto de conectar as partes de um problema para construir uma solução que faça sentido.</p></div></section>
      <section className="overview-deep-dive"><div><Code2 size={23}/><div><h3>Quer explorar a parte técnica?</h3><p>Conheça as arquiteturas, as ferramentas e o laboratório interativo de dados.</p></div></div><button onClick={onEngineer}>Abrir versão técnica <ArrowUpRight size={16}/></button></section>
      <section id="contato" className="overview-contact"><p className="overview-eyebrow">PRÓXIMA CONEXÃO</p><h2>Vamos construir<br/>algo que faça sentido?</h2><a className="overview-cta" href="https://github.com/hugo-antunes19" target="_blank" rel="noopener noreferrer">Conheça meu perfil no GitHub <ArrowUpRight size={17}/></a></section>
    </main><footer className="overview-footer"><span>Hugo Antunes · {new Date().getFullYear()}</span><a href="#apresentacao">Voltar ao início ↑</a></footer>
  </div>;
}
