import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createInterface } from 'node:readline';
import ts from 'typescript';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';

const workerRoots = ['daily', 'hourly', 'realtime'].map(name => `modules/performance/apps/sync-metrics-${name}/src`);
function sourceFiles(directory) {
 return readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? sourceFiles(`${directory}/${entry.name}`) : entry.name.endsWith('.ts') ? [`${directory}/${entry.name}`] : []);
}
const migratedFiles = workerRoots.flatMap(sourceFiles).filter(path => readFileSync(path, 'utf8').includes('labDb.queryFromString'));

async function verify(path, staticOnly = false) {
 const text = readFileSync(path, 'utf8');
 const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
 const queries = [];
 function visit(node) {
  if (ts.isCallExpression(node) && node.expression.getText(source) === 'labDb.queryFromString') {
   const [sql, params] = node.arguments;
   assert.ok(ts.isNoSubstitutionTemplateLiteral(sql), 'Use parameterized SQL without string interpolation');
   assert.ok(ts.isObjectLiteralExpression(params), 'Query parameters must be explicit');
   const placeholders = [...new Set([...sql.text.matchAll(/\$(\d+)/g)].map(match => match[1]))].sort();
   const provided = params.properties.map(property => property.name.getText(source)).sort();
   assert.deepEqual(provided, placeholders, 'Every SQL parameter must be supplied exactly once');
   for (const table of sql.text.matchAll(/(?:FROM|JOIN)\s+((?:simplified_apex|operation)\.\w+)(?:\s+AS\s+\w+)?/g)) {
    assert.ok(sql.text.slice(table.index + table[0].length).trimStart().startsWith('FINAL'), `Versioned source ${table[1]} must be deduplicated`);
   }
   queries.push(sql.text);
  }
  ts.forEachChild(node, visit);
 }
 visit(source);
 assert.ok(queries.length, 'No migrated source queries found');
 assert.ok(!/simplifiedApexValidations|goDb\.operation\.rides|ridesCollection/.test(text), 'Migrated source still reads MongoDB');
 for (const [index, query] of queries.entries()) {
  if (!staticOnly) {
   // Reload fixture assertions when using the interactive per-query workflow.
   const { verifyFixtures } = await import(`./source-query-fixtures.mjs?version=${Date.now()}`);
   const params = await verifyFixtures(labDb, path, query);
   assert.ok((await labDb.queryFromString(`EXPLAIN PLAN ${query}`, params)).length);
  }
  console.log(`PASS ${path} query ${index + 1}: ${staticOnly ? 'parameters and source contract' : 'live schema, SQL fixtures and empty windows'}`);
 }
}

const args = process.argv.slice(2);
if (args.length) {
 try {
  const files = args.includes('--all') || args.includes('--static') ? migratedFiles : args;
  for (const path of files) await verify(path, args.includes('--static'));
  console.log(`Verified ${files.length} migrated source files.`);
  process.exit(0);
 } catch(error) { console.error(error); process.exit(1); }
} else {
 console.log('READY: enter a worker source path per line');
 for await (const path of createInterface({ input: process.stdin })) {
  if (!path.trim()) continue;
  try { await verify(path.trim()); console.log('VERIFIED'); }
  catch(error) { console.error(error); console.log('FAILED'); }
 }
 process.exit(0);
}
