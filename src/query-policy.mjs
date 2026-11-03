// The REPL explores the bundled catalog; it does not import remote/user files.
export function validateQuery(sql) {
  const query = sql.trim().replace(/;\s*$/, '');
  if (!query || query.length > 10000) throw new Error('Digite uma consulta com até 10.000 caracteres.');
  const clean = query.replace(/'(?:''|[^'])*'/g, "''").replace(/"(?:""|[^"])*"/g, '""');
  if (/;|--|\/\*/.test(clean)) throw new Error('Execute uma instrução por vez, sem comentários.');
  if (!/^(SELECT|WITH|EXPLAIN|DESCRIBE|SHOW)\b/i.test(clean)) throw new Error('Use SELECT, WITH, EXPLAIN, DESCRIBE ou SHOW.');
  if (/\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|COPY|ATTACH|DETACH|INSTALL|LOAD|PRAGMA|SET|CALL|EXPORT|IMPORT|SECRET|read_\w+|httpfs|sqlite_scan|postgres_scan)\b/i.test(clean)) throw new Error('Consulte as tabelas locais bronze, silver e gold. Alterações e fontes externas não são habilitadas.');
  // Remove quoted contents before checking structure, but keep raw URLs blocked too.
  if (/https?:\/\/|file:\/\//i.test(query)) throw new Error('Fontes externas não são habilitadas neste catálogo.');
  return query;
}

export function filterQuery(category) {
  const where = category === 'Todos' ? '' : ` WHERE category = '${category.replaceAll("'", "''")}'`;
  return `SELECT * FROM gold.projects${where} ORDER BY professional DESC, title;`;
}

export function prepareQuery(sql) {
  const normalized = validateQuery(sql);
  // Limit in the worker before serializing/allocating Arrow results on the UI thread.
  return /^(SELECT|WITH)\b/i.test(normalized)
    ? `SELECT * FROM (${normalized}) AS __portfolio_result LIMIT 200`
    : normalized;
}
