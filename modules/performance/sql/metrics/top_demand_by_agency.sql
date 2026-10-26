-- top_demand_by_agency: publish only after this statement finishes successfully.
INSERT INTO temp_performance.metric_rows
(metric, run_id, output_date, properties, path, numbers, strings, booleans, scalar)
SELECT 'top_demand_by_agency', {run_id:UUID}, row_date, row_properties, row_path,
       CAST(row_numbers, 'Map(String, Float64)'), CAST(row_strings, 'Map(String, Nullable(String))'),
       CAST(row_booleans, 'Map(String, Bool)'), CAST(row_scalar, 'Nullable(Float64)')
FROM (
WITH source AS (
    SELECT properties['agency_id'] AS agency, if(metric = 'demand_by_agency_by_day', 'day', 'month') AS kind,
           path[1] AS label, numbers['qty'] AS qty
    FROM temp_performance.rows_at(input_runs = {input_runs:Array(UUID)}) WHERE metric IN ('demand_by_agency_by_day', 'demand_by_agency_by_month')
), totals AS (SELECT 'total' AS agency, kind, label, sum(qty) AS qty FROM source GROUP BY kind, label),
records AS (
    SELECT agency, kind, argMax(label, tuple(qty, label)) AS top_label, max(qty) AS top_qty FROM source GROUP BY agency, kind
    UNION ALL SELECT agency, kind, argMax(label, tuple(qty, label)) AS top_label, max(qty) AS top_qty FROM totals GROUP BY agency, kind
)
SELECT toDate('1970-01-01') AS row_date, CAST(map(), 'Map(String, String)') AS row_properties, if(agency = 'total', ['total', kind], ['agencies', agency, kind]) AS row_path, map('qty', top_qty) AS row_numbers, map('date', top_label) AS row_strings, CAST(map(), 'Map(String, Bool)') AS row_booleans, NULL AS row_scalar FROM records
UNION ALL SELECT toDate('1970-01-01') AS row_date, CAST(map(), 'Map(String, String)') AS row_properties, ['agencies'] AS row_path, CAST(map(), 'Map(String, Float64)') AS row_numbers, CAST(map(), 'Map(String, Nullable(String))') AS row_strings, CAST(map(), 'Map(String, Bool)') AS row_booleans, NULL AS row_scalar
UNION ALL SELECT toDate('1970-01-01') AS row_date, CAST(map(), 'Map(String, String)') AS row_properties, ['total'] AS row_path, CAST(map(), 'Map(String, Float64)') AS row_numbers, CAST(map(), 'Map(String, Nullable(String))') AS row_strings, CAST(map(), 'Map(String, Bool)') AS row_booleans, NULL AS row_scalar
UNION ALL
SELECT toDate('1970-01-01') AS row_date, CAST(map(), 'Map(String, String)') AS row_properties,
       ['total', kind] AS row_path, map('qty', 0.) AS row_numbers,
       map('date', '') AS row_strings, CAST(map(), 'Map(String, Bool)') AS row_booleans, NULL AS row_scalar
FROM (SELECT arrayJoin(['day', 'month']) AS kind)
WHERE kind NOT IN (SELECT kind FROM records WHERE agency = 'total')

);
