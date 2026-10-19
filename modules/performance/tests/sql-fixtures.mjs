import assert from 'node:assert/strict';

const start = 1704081600000;
const end = start + 86400000;
const value = input => input === null ? 'NULL' : typeof input === 'number' ? String(input) : `'${input.replaceAll("'", "''")}'`;
const selectRows = rows => rows.map(row => `SELECT ${Object.entries(row).map(([key, item]) => `${value(item)} AS ${key}`).join(', ')}`).join(' UNION ALL ');
const validation = changes => ({ agency_id: 'LA77N', agency_code: '41', created_at: start, is_passenger: 1, line_id: '1001', pattern_id: '1001_0_1', category: 'subscription', product_id: 'p1', ...changes });
const ride = (id, changes) => ({ _id: id, agency_id: 'LA77N', operational_date: 20240101, start_time_scheduled: start, start_time_observed: start + 360000, processing_status: 'complete', passengers_observed: 10, extension_scheduled: 1000, apex_validations_qty: 1, apex_sales_qty: 1, apex_sales_amount: 100, passengers_observed_prepaid_amount: 50, passengers_observed_subscription_qty: 2, route_short_name: '1001', shape_id: '1001_0_1', ...changes });
const validations = [validation(), validation({ created_at: start + 1, category: null, product_id: null, pattern_id: null }), validation({ agency_id: 'BNA17', agency_code: '42', created_at: end - 1, line_id: null, pattern_id: null }), validation({ created_at: end }), validation({ created_at: start - 1 }), validation({ is_passenger: 0 }), validation({ agency_id: 'OTHER' }), validation({ created_at: start - 7 * 86400000 })];
const noSales = { apex_validations_qty: null, apex_sales_qty: null, apex_sales_amount: null, passengers_observed_prepaid_amount: null, passengers_observed_subscription_qty: null };
const rides = [ride('a'), ride('b', { ...noSales, start_time_scheduled: start + 1000, start_time_observed: start + 1000, passengers_observed: 0, extension_scheduled: 2000 }), ride('c', { ...noSales, start_time_scheduled: start + 2000, start_time_observed: null, passengers_observed: 0, extension_scheduled: 3000 }), ride('d', { ...noSales, agency_id: 'BNA17', start_time_scheduled: start + 3000, start_time_observed: 0, passengers_observed: null, extension_scheduled: 4000 }), ride('e', { start_time_scheduled: end, operational_date: 20240102 }), ride('h', { start_time_scheduled: start + 4000, passengers_observed: 5, extension_scheduled: 6000, processing_status: 'incomplete' }), ride('old-low', { start_time_scheduled: start - 86400000, operational_date: 20231231, passengers_observed: 0 }), ride('old-high', { start_time_scheduled: start - 2 * 86400000, operational_date: 20231230, passengers_observed: 10 })];
const analyses = rides.map(r => ({ ride_id: r._id, agency_id: r.agency_id, operational_date: r.operational_date, grade_status: ['b', 'h'].includes(r._id) ? 'fail' : 'pass' }));
const emptyRows = `SELECT '' AS metric, toDate('2024-01-01') AS output_date, CAST(map(), 'Map(String, String)') AS properties, CAST([], 'Array(String)') AS path, CAST(map(), 'Map(String, Float64)') AS numbers, CAST(map(), 'Map(String, Nullable(String))') AS strings, CAST(map(), 'Map(String, Bool)') AS booleans, CAST(NULL, 'Nullable(Float64)') AS scalar WHERE 0`;
const syntheticRows = `SELECT 'demand_by_line_by_day' AS metric, addDays(toDate('2024-01-01'), number) AS output_date, map('line_id', '1001') AS properties, [toString(output_date)] AS path, map('qty', if(number = 0, 10., 20.)) AS numbers, CAST(map('day_type', '1', 'holiday', '0', 'period', '1', 'notes', ''), 'Map(String, Nullable(String))') AS strings, CAST(map(), 'Map(String, Bool)') AS booleans, CAST(NULL, 'Nullable(Float64)') AS scalar FROM numbers(32)`;
function inputRows(metric) {
 if (['mean_demand_by_line_by_month', 'top_lines_30day_performance'].includes(metric)) return syntheticRows;
 const cols = (name, date, props, path, nums) => `SELECT '${name}' AS metric, toDate('${date}') AS output_date, ${props} AS properties, ${path} AS path, ${nums} AS numbers, CAST(map('day_type', '1'), 'Map(String, Nullable(String))') AS strings, CAST(map(), 'Map(String, Bool)') AS booleans, CAST(NULL, 'Nullable(Float64)') AS scalar`;
 if (metric === 'top_mean_demand_by_line_by_month') return [
  cols('mean_demand_by_line_by_month', '2024-01-01', "map('line_id', '1001')", "['2024-01', 'total']", "map('qty', 100., 'avg', 1.)"),
  cols('mean_demand_by_line_by_month', '2024-02-01', "map('line_id', '1001')", "['2024-02', 'total']", "map('qty', 200., 'avg', 1.)"),
 ].join(' UNION ALL ');
 if (metric === 'top_demand_by_agency' || metric === 'top_demand_by_agency_by_day_type') return [
  cols('demand_by_agency_by_day', '2024-01-01', "map('agency_id', '41')", "['2024-01-01']", "map('qty', 100.)"),
  cols('demand_by_agency_by_day', '2024-01-02', "map('agency_id', '41')", "['2024-01-02']", "map('qty', 200.)"),
  cols('demand_by_agency_by_day', '2024-01-01', "map('agency_id', '42')", "['2024-01-01']", "map('qty', 50.)"),
  cols('demand_by_agency_by_month', '2024-01-01', "map('agency_id', '41')", "['2024-01']", "map('qty', 300.)"),
  cols('demand_by_agency_by_month', '2024-01-01', "map('agency_id', '42')", "['2024-01']", "map('qty', 50.)"),
 ].join(' UNION ALL ');
 if (/_by_(month|year)$/.test(metric)) {
  const yearly = metric.endsWith('_by_year');
  const source = metric.replace(/_by_(month|year)$/, yearly ? '_by_month' : '_by_day');
  const nums = "map('qty', 10., 'scheduled_rides', 2., 'accomplished_rides', 1., 'vkms_observed', 1000., 'vkms_scheduled', 2000., 'revenue_per_trip', 3., 'cost_per_trip', 5.)";
  let props = metric.includes('_by_agency_') ? "map('agency_id', '41')" : metric.includes('_by_line_') ? "map('line_id', '1001')" : "map('pattern_id', '1001_0_1')";
  if (metric.startsWith('demand_by_category_')) props = props.slice(0, -1) + ", 'category', 'subscription')";
  if (metric.startsWith('demand_by_product_')) props = props.slice(0, -1) + ", 'product_id', 'p1')";
  if (metric.startsWith('demand_by_pattern_hour_')) props = props.slice(0, -1) + ", 'line_id', '1001', 'hour', '4', 'minute', '0')";
  return [cols(source, '2024-01-01', props, yearly ? "['2024-01']" : "['2024-01-01']", nums), cols(source, yearly ? '2024-02-01' : '2024-01-02', props, yearly ? "['2024-02']" : "['2024-01-02']", nums)].join(' UNION ALL ');
 }
 return emptyRows;
}
const rawTables = {
 'simplified_apex.validations': validations,
 'operation.rides': rides,
 'operation.ride_analysis_simple_three_vehicle_events': analyses,
 'operation.ride_analysis_simple_one_apex_validation': analyses,
 'operation.ride_analysis_expected_start_time': analyses.map(r => ({ ...r, observed_start_time_delta: r.ride_id === 'b' ? -2 : 6 })),
};

export const fixtureParams = {
 agency_ids: ['LA77N', 'BNA17', 'YA15B', 'A2L1N'], legacy_agency_ids: ['41', '42', '43', '44'],
 current_date: 20240101, previous_date: 20231225, current_start: start, previous_start: start - 7 * 86400000,
 previous_until: end - 7 * 86400000, reference_at: end - 1, start_date: '2024-01-01', end_date: '2024-01-01',
 input_runs: ['00000000-0000-0000-0000-000000000001'], run_id: '00000000-0000-0000-0000-000000000002',
};

export function fixtureSelect(sql, metric) {
 let query = /\nFROM \(\n([\s\S]*)\n\);\s*$/.exec(sql)?.[1];
 if (!query) throw new Error('Invalid metric SQL wrapper');
 const definitions = [];
 for (const [table, rows] of Object.entries(rawTables)) {
  const alias = 'fixture_' + table.replaceAll('.', '_');
  query = query.replaceAll(table, alias);
  definitions.push(`${alias} AS (${selectRows(rows)})`);
 }
 query = query.replaceAll(' FINAL', '').replaceAll('temp_performance.rows_at(input_runs = {input_runs:Array(UUID)})', 'fixture_rows').replaceAll('temp_performance.calendar', 'fixture_calendar').replaceAll('temp_performance.agencies', 'fixture_agencies');
 definitions.push(`fixture_rows AS (${inputRows(metric)})`);
 definitions.push(`fixture_calendar AS (SELECT toUUID('00000000-0000-0000-0000-000000000001') AS run_id, toDate('2024-01-01') AS date, '1' AS day_type, '0' AS holiday, '1' AS period, CAST('', 'Nullable(String)') AS notes)`);
 definitions.push(`fixture_agencies AS (SELECT toUUID('00000000-0000-0000-0000-000000000001') AS run_id, 'LA77N' AS agency_id, 2.5 AS price_per_km)`);
 return `WITH ${definitions.join(', ')} SELECT row_date, row_properties, row_path, CAST(row_numbers, 'Map(String, Float64)') AS row_numbers, CAST(row_strings, 'Map(String, Nullable(String))') AS row_strings, CAST(row_booleans, 'Map(String, Bool)') AS row_booleans, CAST(row_scalar, 'Nullable(Float64)') AS row_scalar FROM (${query})`; 
}

export function assertFixture(metric, rows) {
 const agency = id => rows.find(row => row.row_properties.agency_id === id);
 if (/^demand_by_(category|product)_/.test(metric) && metric.endsWith('_by_day')) {
  assert.equal(rows.reduce((sum, row) => sum + row.row_numbers.qty, 0), 3);
  const booleanHoliday = metric.startsWith('demand_by_category_') || metric.startsWith('demand_by_product_by_pattern_');
  for (const row of rows) {
   if (booleanHoliday) assert.equal(row.row_booleans.holiday, false);
   else assert.equal(row.row_strings.holiday, '0');
  }
  if (metric.startsWith('demand_by_product_')) assert.ok(rows.some(row => row.row_properties.product_id === 'unknown-product'));
 }
 if (/_by_(month|year)$/.test(metric) && !['mean_demand_by_line_by_month', 'top_mean_demand_by_line_by_month'].includes(metric)) {
  assert.equal(rows.length, 1);
  if (metric.startsWith('supply_')) {
   assert.equal(rows[0].row_numbers.scheduled_rides, 4); assert.equal(rows[0].row_numbers.cost_per_trip, 10);
  } else assert.equal(rows[0].row_numbers.qty, 20);
 }
 if (metric === 'top_mean_demand_by_line_by_month') {
  const line = rows.find(row => row.row_properties.year_month === '2024-02' && row.row_path[0] === '1001');
  assert.equal(line.row_numbers.qty, 200); assert.equal(line.row_numbers.year_avg, 150); assert.equal(line.row_numbers.increase_pct, 33.33);
 }
 if (metric === 'top_demand_by_agency') {
  const total = rows.find(row => row.row_path.join('/') === 'total/month');
  assert.equal(total.row_numbers.qty, 350); assert.equal(total.row_strings.date, '2024-01');
 }
 if (metric === 'top_demand_by_agency_by_day_type') {
  const total = rows.find(row => row.row_path.join('/') === 'total/day_type_1/2024-01-01');
  assert.equal(total.row_scalar, 150);
 }
 if (metric === 'realtime_service_compliance') {
  const total = rows.find(row => row.row_path.join('/') === 'total/scheduled_rides' && 'now' in row.row_numbers);
  assert.equal(total.row_numbers.now, 4);
  const mean = rows.find(row => row.row_path.join('/') === 'total/mean_delay_minutes' && 'now' in row.row_numbers);
  assert.equal(mean.row_numbers.now, 1.5);
 }

 if (metric === 'demand_by_agency_by_day') {
  assert.equal(agency('41').row_numbers.qty, 2);
  assert.equal(agency('42').row_numbers.qty, 1);
 }
 if (metric === 'supply_by_agency_by_day') {
  assert.equal(agency('LA77N').row_numbers.scheduled_rides, 4);
  assert.equal(agency('LA77N').row_numbers.accomplished_rides, 3);
  assert.equal(agency('LA77N').row_numbers.vkms_observed, 10000);
  assert.equal(agency('LA77N').row_numbers.cost_per_trip, 30);
  assert.equal(agency('LA77N').row_numbers.revenue_per_trip, 7);
 }
 if (metric === 'demand_by_pattern_hour_by_day') {
  assert.equal(rows.length, 1); assert.equal(rows[0].row_properties.hour, '4'); assert.equal(rows[0].row_numbers.qty, 15);
 }
 if (metric === 'demand_affected_by_failed_circulations_by_day') {
  assert.equal(rows.length, 1); assert.equal(rows[0].row_numbers.failed_circulations, 1); assert.equal(rows[0].row_numbers.estimated_affected_passengers, 5);
 }
 if (metric === 'mean_demand_by_line_by_month') {
  const total = rows.find(row => row.row_path[0] === '2024-01' && row.row_path[1] === 'total');
  assert.equal(total.row_numbers.qty, 610); assert.equal(total.row_numbers.count, 31); assert.equal(total.row_numbers.avg, 20);
 }
 if (metric === 'top_lines_30day_performance') {
  const line = rows.find(row => row.row_path.join('/') === 'top_performers/1001');
  assert.equal(line.row_numbers.last_30_days_total, 620); assert.equal(line.row_numbers.ytd_avg, 20);
 }
 if (metric === 'realtime_demand') {
  const total = rows.find(row => row.row_path.join('/') === 'total');
  assert.equal(total.row_numbers.now, 3); assert.equal(total.row_numbers.last_week, 1);
 }
}
