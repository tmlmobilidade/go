import assert from 'node:assert/strict';

const agencies = ['LA77N', 'BNA17', 'YA15B', 'A2L1N'];
const start = 1704081600000;
const end = start + 86_400_000;
const previousStart = start - 7 * 86_400_000;
const validation = (changes = {}) => ({ agency_id: 'LA77N', agency_code: '41', created_at: start, is_passenger: 1, line_id: '1001', pattern_id: '1001_0_1', product_id: 'p1', category: 'subscription', ...changes });
const validations = [
 validation(), validation({ created_at: start + 1, pattern_id: null, product_id: null, category: 'prepaid' }),
 validation({ agency_id: 'BNA17', agency_code: '42', created_at: end - 1, line_id: null, pattern_id: null, product_id: null, category: 'prepaid' }),
 validation({ created_at: end }), validation({ created_at: start - 1 }), validation({ is_passenger: 0 }), validation({ agency_id: 'OTHER', agency_code: '1' }),
 validation({ created_at: previousStart }), validation({ created_at: previousStart - 1 }),
];
const ride = (_id, changes = {}) => ({
 _id, agency_id: 'LA77N', operational_date: 20240101, start_time_scheduled: start, start_time_observed: start + 360000,
 processing_status: 'complete', passengers_observed: 10, extension_scheduled: 1000,
 apex_validations_qty: 1, apex_sales_qty: 1, apex_sales_amount: 100,
 passengers_observed_prepaid_amount: 50, passengers_observed_subscription_qty: 2,
 route_short_name: '1001', shape_id: '1001_0_1', ...changes,
});
const noSales = { apex_validations_qty: null, apex_sales_qty: null, apex_sales_amount: null, passengers_observed_prepaid_amount: null, passengers_observed_subscription_qty: null };
const rides = [
 ride('a'),
 ride('b', { ...noSales, start_time_scheduled: start + 1000, start_time_observed: start + 1000, passengers_observed: 0, extension_scheduled: 2000 }),
 ride('c', { ...noSales, start_time_scheduled: start + 2000, start_time_observed: null, passengers_observed: 0, extension_scheduled: 3000 }),
 ride('d', { ...noSales, agency_id: 'BNA17', start_time_scheduled: start + 3000, start_time_observed: 0, passengers_observed: null, extension_scheduled: 4000 }),
 ride('e', { start_time_scheduled: end, start_time_observed: end, operational_date: 20240102 }),
 ride('f', { agency_id: 'OTHER' }),
 ride('g', { start_time_scheduled: start - 1, operational_date: 20231231 }),
 ride('h', { ...noSales, start_time_scheduled: start + 4000, passengers_observed: 5, extension_scheduled: 6000, processing_status: 'incomplete' }),
];
const grades = { a: 'pass', b: 'fail', c: 'pass', e: 'pass', f: 'pass', g: 'pass', h: 'fail' };
const deltas = { a: 6, b: -2, c: -1, e: 1, f: 0, g: 0, h: 2 };
const analyses = Object.entries(grades).map(([ride_id, grade_status]) => ({ ride_id, grade_status, agency_id: rides.find(r => r._id === ride_id).agency_id, operational_date: rides.find(r => r._id === ride_id).operational_date }));
const tables = {
 'simplified_apex.validations': validations,
 'operation.rides': rides,
 'operation.ride_analysis_simple_three_vehicle_events': analyses,
 'operation.ride_analysis_simple_one_apex_validation': analyses.map(a => ({ ...a, grade_status: a.ride_id === 'h' ? 'pass' : a.grade_status })),
 'operation.ride_analysis_expected_start_time': analyses.map(a => ({ ...a, observed_start_time_delta: deltas[a.ride_id] })),
};
const valueSql = value => value === null ? 'NULL' : typeof value === 'number' ? String(value) : `'${value.replaceAll("'", "''")}'`;
const asSql = rows => rows.map(row => `SELECT ${Object.entries(row).map(([key, value]) => `${valueSql(value)} AS ${key}`).join(', ')}`).join(' UNION ALL ');
const canonical = rows => rows.map(row => JSON.stringify(Object.fromEntries(Object.entries(row).sort(([a], [b]) => a.localeCompare(b))))).sort();
const sameRows = (actual, expected) => assert.deepEqual(canonical(actual), canonical(expected));

export async function verifyFixtures(db, path, query) {
 const params = { 1: start, 2: end, 3: agencies, 4: '2024-01-01', 5: end };
 if (path.includes('sync-realtime-demand')) { params[4] = previousStart; params[5] = previousStart + 86_400_000; }
 if (/operational_date = \$1/.test(query)) params[1] = 20240101;
 if (query.includes('pattern_hour IN $4')) params[4] = ['1001_0_1_04:00'];
 if (path.includes('sync-service-compliance')) { params[4] = end; params[5] = 0; }
 const selectedParams = Object.fromEntries(Object.entries(params).filter(([key]) => query.includes(`$${key}`)));
 const definitions = [];
 let fixtureQuery = query;
 for (const [name, rows] of Object.entries(tables)) {
  if (!query.includes(name)) continue;
  const alias = `fixture_${name.replaceAll('.', '_')}`;
  definitions.push(`${alias} AS (${asSql(rows)})`);
  fixtureQuery = fixtureQuery.replaceAll(name, alias);
 }
 fixtureQuery = fixtureQuery.replaceAll(' FINAL', '');
 fixtureQuery = fixtureQuery.trimStart().startsWith('WITH ')
  ? fixtureQuery.replace('WITH ', `WITH ${definitions.join(', ')}, `)
  : `WITH ${definitions.join(', ')} ${fixtureQuery}`;
 const rows = await db.queryFromString(fixtureQuery, selectedParams);
 if (query.includes('FROM simplified_apex.validations')) {
  if (query.includes('countIf')) {
   sameRows(rows, [{ agency_id: '41', now: 3, last_week: 1 }, { agency_id: '42', now: 1, last_week: 0 }]);
  } else {
   const fields = /GROUP BY ([\w, ]+)/.exec(query)[1].split(',').map(field => field.trim());
   const expected = new Map();
   for (const row of validations.filter(row => agencies.includes(row.agency_id) && row.is_passenger && row.created_at >= start && row.created_at < end)) {
    const key = JSON.stringify(fields.map(field => row[field]));
    expected.set(key, (expected.get(key) ?? 0) + 1);
   }
   const actual = new Map(rows.map(row => [JSON.stringify(fields.map(field => field === 'agency_code' ? row._id ?? row.agency_id : row[field] ?? row._id ?? null)), row.count]));
   assert.deepEqual(actual, expected);
   assert.ok(rows.every(row => typeof row.count === 'number'));
   if (query.includes('$4 AS day')) assert.ok(rows.every(row => row.day === '2024-01-01'));
  }
 } else if (path.includes('demand_by_pattern_hour')) {
  sameRows(rows, [{ hour: 4, minute: 0, line_id: '1001', pattern_id: '1001_0_1', total_passengers: 15 }]);
 } else if (path.includes('supply_by_agency') && query.includes('LIMIT 1')) {
  sameRows(rows, [{ operational_date: '20240102' }]);
 } else if (path.includes('supply_by_agency')) {
  sameRows(rows, [
   { _id: 'LA77N', accomplished_rides: 3, scheduled_rides: 4, vkms_observed: 10000, vkms_scheduled: 12000, revenue_per_trip: 3.5 },
   { _id: 'BNA17', accomplished_rides: 0, scheduled_rides: 1, vkms_observed: 0, vkms_scheduled: 4000, revenue_per_trip: 0 },
  ]);
 } else if (query.includes('pattern_hour IN $4')) {
  sameRows(rows.map(row => ({ ...row, values: row.values.sort((a,b) => a-b) })), [{ agency_id: 'LA77N', pattern_hour: '1001_0_1_04:00', values: [0, 0, 5, 10] }]);
 } else if (path.includes('passenger-impact')) {
  sameRows(rows, [{ agency_id: 'LA77N', operational_date: '20240101', pattern_hour: '1001_0_1_04:00' }]);
 } else if (path.includes('sync-service-compliance')) {
  const expected = [
   { agency_id: 'LA77N', scheduled_rides: 3, rides_with_sales: 1, accomplished_rides: 2, valid_rides: 2, no_passengers_rides: 1, advanced_rides: 1, five_min_delays: 1, mean_delay_minutes: 6 },
   { agency_id: 'BNA17', scheduled_rides: 1, rides_with_sales: 0, accomplished_rides: 0, valid_rides: 0, no_passengers_rides: 0, advanced_rides: 0, five_min_delays: 0, mean_delay_minutes: 0 },
  ];
  sameRows(rows, expected);
  const historical = await db.queryFromString(fixtureQuery, { ...selectedParams, 5: 1 });
  sameRows(historical, [{ ...expected[0], scheduled_rides: 2, accomplished_rides: 1, valid_rides: 1, no_passengers_rides: 0, advanced_rides: 0 }, expected[1]]);
  // Preserve the five-minute scheduled start cutoff, including its exact boundary.
  const cutoff = await db.queryFromString(fixtureQuery, { ...selectedParams, 2: start });
  sameRows(cutoff, [{ ...expected[0], scheduled_rides: 1, accomplished_rides: 1, valid_rides: 1, no_passengers_rides: 0, advanced_rides: 0 }]);
 } else {
  assert.fail(`Missing fixture expectations for ${path}`);
 }
 // Summer fixtures distinguish the existing UTC dashboard buckets from Lisbon impact buckets.
 if (path.includes('demand_by_pattern_hour') || path.includes('passenger-impact')) {
  const summerStart = Date.parse('2024-07-01T03:00:00Z');
  const offset = summerStart - start;
  const summerDefinitions = [];
  let summerQuery = query;
  for (const [name, tableRows] of Object.entries(tables)) {
   if (!query.includes(name)) continue;
   const alias = `fixture_${name.replaceAll('.', '_')}`;
   const shifted = tableRows.map(row => Object.fromEntries(Object.entries(row).map(([key, value]) => {
    if (['created_at', 'start_time_scheduled', 'start_time_observed'].includes(key) && value > 0) return [key, value + offset];
    if (key === 'operational_date') return [key, ({ 20240101: 20240701, 20240102: 20240702, 20231231: 20240630 })[value]];
    return [key, value];
   })));
   summerDefinitions.push(`${alias} AS (${asSql(shifted)})`);
   summerQuery = summerQuery.replaceAll(name, alias);
  }
  summerQuery = `WITH ${summerDefinitions.join(', ')} ${summerQuery.replaceAll(' FINAL', '')}`;
  const summerRows = await db.queryFromString(summerQuery, { ...selectedParams, 1: summerStart, 2: summerStart + 86_400_000 });
  if (path.includes('demand_by_pattern_hour')) sameRows(summerRows, [{ hour: 3, minute: 0, line_id: '1001', pattern_id: '1001_0_1', total_passengers: 15 }]);
  else if (query.includes('pattern_hour IN $4')) sameRows(summerRows.map(row => ({ ...row, values: row.values.sort((a,b) => a-b) })), [{ agency_id: 'LA77N', pattern_hour: '1001_0_1_04:00', values: [0, 0, 5, 10] }]);
  else sameRows(summerRows, [{ agency_id: 'LA77N', operational_date: '20240701', pattern_hour: '1001_0_1_04:00' }]);
 }
 // Empty source windows must return no groups, rather than fabricated zero rows.
 if (query.includes('start_time_scheduled >= $1') || query.includes('created_at >= $1')) {
  const emptyParams = { ...selectedParams, 1: end + 1, 2: end + 2 };
  if (query.includes('countIf')) { emptyParams[4] = end + 1; emptyParams[5] = end + 2; }
  assert.deepEqual(await db.queryFromString(fixtureQuery, emptyParams), []);
 }
 return selectedParams;
}
