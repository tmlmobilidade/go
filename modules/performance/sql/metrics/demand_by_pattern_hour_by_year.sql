-- demand_by_pattern_hour_by_year: publish only after this statement finishes successfully.
INSERT INTO temp_performance.metric_rows
(metric, run_id, output_date, properties, path, numbers, strings, booleans, scalar)
SELECT 'demand_by_pattern_hour_by_year', {run_id:UUID}, row_date, row_properties, row_path,
       CAST(row_numbers, 'Map(String, Float64)'), CAST(row_strings, 'Map(String, Nullable(String))'),
       CAST(row_booleans, 'Map(String, Bool)'), CAST(row_scalar, 'Nullable(Float64)')
FROM (
SELECT toStartOfYear(output_date) AS row_date, properties AS row_properties, [toString(toYear(row_date))] AS row_path, map('qty', sum(numbers['qty'])) AS row_numbers, CAST(map(), 'Map(String, Nullable(String))') AS row_strings, CAST(map(), 'Map(String, Bool)') AS row_booleans, NULL AS row_scalar FROM temp_performance.rows_at(input_runs = {input_runs:Array(UUID)}) WHERE metric = 'demand_by_pattern_hour_by_month' GROUP BY row_date, properties
);
