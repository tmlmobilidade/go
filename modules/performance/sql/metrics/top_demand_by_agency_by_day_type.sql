-- top_demand_by_agency_by_day_type: publish only after this statement finishes successfully.
INSERT INTO temp_performance.metric_rows
(metric, run_id, output_date, properties, path, numbers, strings, booleans, scalar)
SELECT 'top_demand_by_agency_by_day_type', {run_id:UUID}, row_date, row_properties, row_path,
       CAST(row_numbers, 'Map(String, Float64)'), CAST(row_strings, 'Map(String, Nullable(String))'),
       CAST(row_booleans, 'Map(String, Bool)'), CAST(row_scalar, 'Nullable(Float64)')
FROM (
WITH source AS (
    SELECT properties['agency_id'] AS agency, path[1] AS label, strings['day_type'] AS type, numbers['qty'] AS qty
    FROM temp_performance.rows_at(input_runs = {input_runs:Array(UUID)}) WHERE metric = 'demand_by_agency_by_day' AND type IN ('1', '2', '3') AND qty > 0
), values AS (
    SELECT agency, label, type, max(qty) AS qty FROM source GROUP BY agency, label, type
    UNION ALL SELECT 'total' AS agency, label, type, sum(qty) AS qty FROM source GROUP BY label, type
), ranked AS (
    SELECT *, row_number() OVER (PARTITION BY agency, type ORDER BY qty DESC, label) AS rank FROM values
)
SELECT toDate('1970-01-01') AS row_date, CAST(map(), 'Map(String, String)') AS row_properties, if(agency = 'total', ['total', concat('day_type_', type), label], ['agencies', agency, concat('day_type_', type), label]) AS row_path, CAST(map(), 'Map(String, Float64)') AS row_numbers, CAST(map(), 'Map(String, Nullable(String))') AS row_strings, CAST(map(), 'Map(String, Bool)') AS row_booleans, qty AS row_scalar FROM ranked WHERE rank <= 5
UNION ALL SELECT toDate('1970-01-01') AS row_date, CAST(map(), 'Map(String, String)') AS row_properties, ['agencies'] AS row_path, CAST(map(), 'Map(String, Float64)') AS row_numbers, CAST(map(), 'Map(String, Nullable(String))') AS row_strings, CAST(map(), 'Map(String, Bool)') AS row_booleans, NULL AS row_scalar
UNION ALL SELECT toDate('1970-01-01') AS row_date, CAST(map(), 'Map(String, String)') AS row_properties, ['total'] AS row_path, CAST(map(), 'Map(String, Float64)') AS row_numbers, CAST(map(), 'Map(String, Nullable(String))') AS row_strings, CAST(map(), 'Map(String, Bool)') AS row_booleans, NULL AS row_scalar
);
