import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateQuery, filterQuery, prepareQuery } from '../src/query-policy.mjs';

test('permite consultas analíticas, CTE, metadados e explain locais', () => {
  for (const sql of ['SELECT * FROM gold.projects;', 'WITH x AS (SELECT * FROM gold.projects) SELECT count(*) FROM x;', 'EXPLAIN ANALYZE SELECT * FROM gold.projects;', 'DESCRIBE gold.projects;', 'SHOW TABLES;', "SELECT 'DROP; --' AS literal;"]) assert.doesNotThrow(() => validateQuery(sql));
});
test('bloqueia mutação, múltiplas instruções e acesso externo', () => {
  for (const sql of ['', 'DELETE FROM gold.projects;', 'SELECT 1; DROP TABLE gold.projects', "SELECT * FROM read_json('https://example.com/data.json')", 'WITH x AS (SELECT 1) DELETE FROM gold.projects;', 'SELECT 1 -- bypass', 'SELECT * FROM read_csv_auto(\'data.csv\')']) assert.throws(() => validateQuery(sql));
});
test('filtros escapam literais e não geram cláusula para Todos', () => {
  assert.equal(filterQuery('Todos'), 'SELECT * FROM gold.projects ORDER BY professional DESC, title;');
  assert.match(filterQuery("Data's"), /category = 'Data''s'/);
});
test('limita resultados no SQL antes de transferir ao navegador', () => {
  assert.equal(prepareQuery('SELECT * FROM range(10000000);'), 'SELECT * FROM (SELECT * FROM range(10000000)) AS __portfolio_result LIMIT 200');
  assert.match(prepareQuery('WITH x AS (SELECT 1) SELECT * FROM x;'), /LIMIT 200$/);
  assert.equal(prepareQuery('EXPLAIN ANALYZE SELECT 1;'), 'EXPLAIN ANALYZE SELECT 1');
  assert.equal(prepareQuery('DESCRIBE gold.projects;'), 'DESCRIBE gold.projects');
});
