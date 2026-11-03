export type Project = {
  id: string; title: string; category: string; tagline: string; description: string;
  contribution: string; outcome: string; stack: string[]; access: string; url: string; professional: boolean;
};
export type QueryResult = { columns: string[]; rows: Record<string, unknown>[]; duration: number; sql: string };
export type EngineStatus = 'loading' | 'ready' | 'error';
export type QueryMetric = { n: number; ms: number };
