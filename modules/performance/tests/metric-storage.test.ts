import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';

import { METRICS } from '../packages/scripts/src/catalog.js';
import { filterMetricDates, formatMetrics } from '../packages/scripts/src/read.js';
import { type MetricRow, sqlFile } from '../packages/scripts/src/storage.js';

const row = (changes: Partial<MetricRow> = {}): MetricRow => ({
 booleans: {}, generated_at: 1792238400000, metric: 'demand_by_agency_by_day', numbers: { qty: 12 },
 output_date: '2026-10-17', path: ['2026-10-17'], properties: { agency_id: '41' }, scalar: null,
 strings: { day_type: '2', holiday: '0', notes: null, period: '1' }, ...changes,
});

test('structured rows retain compatible metric payloads, metadata, and numeric pattern-hour properties', () => {
 const [doc] = formatMetrics([row(), row({ numbers: { qty: 13 }, output_date: '2026-10-18', path: ['2026-10-18'] })]);
 assert.equal(doc.metric, 'demand_by_agency_by_day');
 assert.deepEqual(doc.properties, { agency_id: '41' });
 assert.deepEqual(doc.data['2026-10-17'], { qty: 12, day_type: '2', holiday: '0', notes: null, period: '1' });
 assert.equal(doc.generated_at.toISOString(), '2026-10-17T12:00:00.000Z');
 const [pattern] = formatMetrics([row({ properties: { hour: '4', minute: '5', line_id: '1001', pattern_id: '1001_0_1' } })]);
 assert.equal(pattern.properties?.hour, 4); assert.equal(pattern.properties?.minute, 5);
});

test('realtime comparison rows merge at their nested paths without computing totals in JavaScript', () => {
 const rows = [row({ metric: 'realtime_service_compliance', properties: {}, path: ['agencies', 'LA77N', 'scheduled_rides'], numbers: { now: 3 }, strings: {} }), row({ metric: 'realtime_service_compliance', properties: {}, path: ['agencies', 'LA77N', 'scheduled_rides'], numbers: { last_week: 2 }, strings: {} }), row({ metric: 'realtime_service_compliance', properties: {}, path: ['total', 'scheduled_rides'], numbers: { now: 100, last_week: 200 }, strings: {} })];
 const [doc] = formatMetrics(rows);
 assert.deepEqual(doc.data, { agencies: { LA77N: { scheduled_rides: { now: 3, last_week: 2 } } }, total: { scheduled_rides: { now: 100, last_week: 200 } } });
});

test('rankings retain scalar leaves and boolean holiday flags; identifiers cannot alter object prototypes', () => {
 const [doc] = formatMetrics([row({ properties: {}, path: ['agencies', '__proto__', 'day_type_1', '2026-10-17'], scalar: 5, numbers: {}, strings: {} }), row({ properties: {}, path: ['total'], numbers: {}, strings: {}, booleans: { holiday: false } })]);
 assert.deepEqual(Object.keys(doc.data), ['agencies', 'total']);
 assert.equal(Object.getPrototypeOf(doc.data), Object.prototype);
 assert.equal(Object.hasOwn(Object.prototype, 'day_type_1'), false);
 assert.deepEqual(doc.data.total, { holiday: false });
});

test('date filters preserve inclusive daily/monthly/yearly behavior', () => {
 assert.deepEqual(filterMetricDates({ '2024-01-01': 1, '2024-01-31': 2, '2024-02-01': 3 }, '2024-01', '2024-01'), { '2024-01-01': 1, '2024-01-31': 2 });
 assert.deepEqual(filterMetricDates({ '2023': 1, '2024': 2 }, '2024', '2024'), { '2024': 2 });
 assert.deepEqual(filterMetricDates({ '2024-01-01': 1, '2024-01-02': 2 }, '2024-01-02'), { '2024-01-02': 2 });
});

test('all 41 SQL jobs are dependency-ordered and their SQL assets resolve from the module package', async () => {
 assert.equal(METRICS.length, 41);
 assert.equal(new Set(METRICS.map(metric => metric.id)).size, 41);
 const seen = new Set<string>();
 for (const metric of METRICS) {
  for (const id of metric.dependencies) assert.ok(seen.has(id), `${metric.id} must run after ${id}`);
  const sql = await readFile(sqlFile(`metrics/${metric.id}.sql`), 'utf8');
  assert.match(sql, /INSERT INTO temp_performance.metric_rows/);
  assert.match(sql, /\{run_id:UUID\}/);
  seen.add(metric.id);
 }
});
