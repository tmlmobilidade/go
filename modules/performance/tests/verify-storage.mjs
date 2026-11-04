import assert from 'node:assert/strict';
import { ClickHouseDatabaseClient, splitClickHouseStatements } from '@tmlmobilidade/go-clients-clickhouse';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const metric = '__test_' + randomUUID();
const runs = Array.from({ length: 8 }, () => randomUUID());
const stamp = Date.now();
let client;
try {
 client = await ClickHouseDatabaseClient.getClient({ prefix: 'LABDB', tunnelType: 'GO' });
 const writeRows = async (run, qty, date = '2024-01-01') => client.insert({ table: 'temp_performance.metric_rows', format: 'JSONEachRow', clickhouse_settings: { async_insert: 0 }, values: [{ metric, run_id: run, output_date: date, properties: { agency_id: '41' }, path: [date], numbers: { qty }, strings: {}, booleans: {}, scalar: null }] });
 const publish = async (run, order, start = '2024-01-01', end = '2024-01-01') => client.insert({ table: 'temp_performance.refreshes', format: 'JSONEachRow', clickhouse_settings: { async_insert: 0 }, values: [{ metric, run_id: run, range_start: start, range_end: end, reference_at: stamp + order }] });
 const snapshotSql = await readFile(new URL('../sql/storage/snapshot.sql', import.meta.url), 'utf8');
 const readSql = await readFile(new URL('../sql/storage/read.sql', import.meta.url), 'utf8');
 const read = async () => {
  const refs = await (await client.query({ query: snapshotSql, query_params: { metrics: [metric] }, format: 'JSONEachRow' })).json();
  return (await client.query({ query: readSql, query_params: { input_runs: refs.map(row => row.run_id), metric, line_ids: [], pattern_ids: [] }, format: 'JSONEachRow' })).json();
 };
 await writeRows(runs[0], 4); await publish(runs[0], 10);
 assert.equal((await read())[0].numbers.qty, 4);
 await writeRows(runs[1], 9);
 assert.equal((await read())[0].numbers.qty, 4, 'An unpublished or failed run must remain invisible');
 await publish(runs[1], 30);
 assert.equal((await read())[0].numbers.qty, 9);
 await writeRows(runs[2], 100); await publish(runs[2], 20);
 assert.equal((await read())[0].numbers.qty, 9, 'A slower older run must not replace newer results');
 await writeRows(runs[3], 6, '2024-01-02'); await publish(runs[3], 40, '2024-01-02', '2024-01-02');
 assert.equal((await read()).length, 2, 'Disjoint output ranges retain their previous successful data');
 await publish(runs[4], 50);
 const last = await read();
 assert.equal(last.length, 1, 'A complete empty range removes stale rows');
 assert.equal(last[0].output_date, '2024-01-02');
 const oldDate = new Date(stamp - 8 * 86400000).toISOString().replace('T', ' ').slice(0, 23);
 for (const [run, qty] of [[runs[5], 8], [runs[6], 7], [runs[7], 100]]) {
  await client.insert({ table: 'temp_performance.metric_rows', format: 'JSONEachRow', clickhouse_settings: { async_insert: 0 }, values: [{ metric, run_id: run, output_date: '2024-01-03', properties: {}, path: ['2024-01-03'], numbers: { qty }, strings: {}, booleans: {}, scalar: null, created_at: oldDate }] });
 }
 for (const [run, order] of [[runs[5], 2], [runs[6], 1]]) {
  await client.insert({ table: 'temp_performance.refreshes', format: 'JSONEachRow', clickhouse_settings: { async_insert: 0 }, values: [{ metric, run_id: run, range_start: '2024-01-03', range_end: '2024-01-03', reference_at: stamp - 8 * 86400000 + order, published_at: oldDate }] });
 }
 const cleanup = await readFile(new URL('../sql/storage/cleanup.sql', import.meta.url), 'utf8');
 for (const query of splitClickHouseStatements(cleanup)) await client.command({ query, query_params: { cutoff: stamp - 7 * 86400000 } });
 const retained = await (await client.query({ query: 'SELECT toString(run_id) AS run_id FROM temp_performance.metric_rows WHERE metric = {metric:String}', query_params: { metric }, format: 'JSONEachRow' })).json();
 assert.ok(retained.some(row => row.run_id === runs[5]), 'Keep a long-lived last-good result');
 assert.ok(!retained.some(row => row.run_id === runs[6]), 'Remove obsolete generations');
 assert.ok(!retained.some(row => row.run_id === runs[7]), 'Remove old unpublished partial results');
 console.info('Verified atomic publication, overlap ordering, empty replacements, and safe retention.');
} finally {
 if (client) {
  for (const table of ['metric_rows', 'refreshes']) await client.command({ query: `ALTER TABLE temp_performance.${table} DELETE WHERE metric = {metric:String} SETTINGS mutations_sync = 1`, query_params: { metric } });
 }
 await ClickHouseDatabaseClient.disconnectAll();
}
