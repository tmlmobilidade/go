import assert from 'node:assert/strict';
import { ClickHouseDatabaseClient } from '@tmlmobilidade/go-clients-clickhouse';
import { readFile, readdir } from 'node:fs/promises';
import { MetricSchema } from '@tmlmobilidade/go-types-performance';
import { formatMetrics } from '../packages/scripts/dist/read.js';
import { assertFixture, fixtureParams, fixtureSelect } from './sql-fixtures.mjs';

const directory = new URL('../sql/metrics/', import.meta.url);
const files = (await readdir(directory)).filter(file => file.endsWith('.sql')).sort();
assert.equal(files.length, 41, 'Every existing working metric must have a SQL file');
let client;
try {
 if (process.argv.includes('--all')) client = await ClickHouseDatabaseClient.getClient({ prefix: 'LABDB', tunnelType: 'GO' });
 for (const file of files) {
  const metric = file.slice(0, -4);
  const sql = await readFile(new URL(file, directory), 'utf8');
  assert.match(sql, /INSERT INTO temp_performance.metric_rows/);
  assert.match(sql, /\{run_id:UUID\}/);
  if (client) {
   const params = { ...fixtureParams, ...(metric === 'top_lines_30day_performance' ? { end_date: '2024-02-01' } : metric === 'demand_affected_by_failed_circulations_by_day' ? { end_date: '2024-01-02' } : {}) };
   const result = await client.query({ query: fixtureSelect(sql, metric), query_params: params, format: 'JSONEachRow' });
   const values = await result.json();
   // The production insert projection standardizes these column aliases.
   const rows = values.map(row => ({ ...row, row_date: row.output_date ?? row.row_date, row_properties: row.properties ?? row.row_properties, row_path: row.path ?? row.row_path, row_numbers: row.numbers ?? row.row_numbers }));
   assertFixture(metric, rows);
   const docs = formatMetrics(rows.map(row => ({ metric, generated_at: fixtureParams.reference_at, output_date: row.row_date, path: row.row_path, properties: row.row_properties, numbers: row.row_numbers, strings: row.row_strings, booleans: row.row_booleans, scalar: row.row_scalar })));
   for (const doc of docs) MetricSchema.parse(doc);
   const productionSelect = sql.slice(sql.indexOf('\nSELECT ') + 1);
   await (await client.query({ query: 'EXPLAIN PLAN ' + productionSelect, query_params: params, format: 'JSONEachRow' })).json();
  }
 }
 console.info(`Verified ${files.length} metric SQL files${client ? ' against ClickHouse fixtures' : ' (static)'}.`);
} finally {
 await ClickHouseDatabaseClient.disconnectAll();
}
