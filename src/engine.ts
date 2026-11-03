import type { QueryResult } from './types';
import * as duckdb from '@duckdb/duckdb-wasm';
import wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import workerUrl from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import { prepareQuery } from './query-policy.mjs';

let current: Promise<{ db: duckdb.AsyncDuckDB; conn: duckdb.AsyncDuckDBConnection; version: string; bytes: number }> | undefined;
let activeDB: duckdb.AsyncDuckDB | undefined;
let generation = 0;

export function startEngine() {
  if (current) return current;
  const epoch = generation;
  current = (async () => {
    const worker = new Worker(workerUrl);
    const db = new duckdb.AsyncDuckDB(new duckdb.VoidLogger(), worker);
    activeDB = db;
    try {
      await db.instantiate(wasm);
      const conn = await db.connect();
      const response = await fetch(`${import.meta.env.BASE_URL}data/projects.json`);
      if (!response.ok) throw new Error('O catálogo de projetos não pôde ser carregado.');
      const raw = await response.text();
      await db.registerFileText('projects.json', raw);
      await conn.query(`SET memory_limit='128MB'; CREATE SCHEMA bronze; CREATE SCHEMA silver; CREATE SCHEMA gold;
        CREATE TABLE bronze.projects AS SELECT * FROM read_json_auto('projects.json');
        CREATE TABLE silver.projects AS SELECT DISTINCT * FROM bronze.projects WHERE id IS NOT NULL AND title IS NOT NULL;
        CREATE TABLE gold.projects AS SELECT * FROM silver.projects;
        CREATE TABLE gold.technologies AS SELECT id AS project_id, unnest(stack) AS technology FROM gold.projects;`);
      const demo = await fetch(`${import.meta.env.BASE_URL}data/pipeline-demo.json`);
      if (!demo.ok) throw new Error('Os dados de demonstração não puderam ser carregados.');
      await db.registerFileText('pipeline-demo.json', await demo.text());
      await conn.query(`CREATE SCHEMA demo; CREATE TABLE demo.pipeline_events AS SELECT * FROM read_json_auto('pipeline-demo.json');`);
      if (epoch !== generation) { await db.terminate(); throw new Error('Inicialização cancelada.'); }
      return { db, conn, version: await db.getVersion(), bytes: new TextEncoder().encode(raw).byteLength };
    } catch (error) {
      await db.terminate();
      if (epoch === generation) { current = undefined; activeDB = undefined; }
      throw error;
    }
  })();
  return current;
}

export async function runQuery(sql: string): Promise<QueryResult> {
  const boundedSQL = prepareQuery(sql);
  const { conn } = await startEngine();
  const start = performance.now();
  const table = await conn.query(boundedSQL);
  const columns = table.schema.fields.map(field => field.name);
  const rows = table.slice(0, 200).toArray().map(row => Object.fromEntries(columns.map(name => [name, row[name]])));
  return { columns, rows, duration: performance.now() - start, sql };
}

export async function resetEngine() {
  generation++;
  const db = activeDB;
  current = undefined; activeDB = undefined;
  if (db) await db.terminate();
}
