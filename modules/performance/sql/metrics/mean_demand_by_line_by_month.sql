-- mean_demand_by_line_by_month: publish only after this statement finishes successfully.
INSERT INTO temp_performance.metric_rows
(metric, run_id, output_date, properties, path, numbers, strings, booleans, scalar)
SELECT 'mean_demand_by_line_by_month', {run_id:UUID}, row_date, row_properties, row_path,
       CAST(row_numbers, 'Map(String, Float64)'), CAST(row_strings, 'Map(String, Nullable(String))'),
       CAST(row_booleans, 'Map(String, Bool)'), CAST(row_scalar, 'Nullable(Float64)')
FROM (
WITH grouped AS (
    SELECT properties['line_id'] AS line_id, toStartOfMonth(output_date) AS month,
           multiIf(strings['day_type'] = '1', 'weekday', strings['day_type'] = '2', 'saturday', strings['day_type'] = '3', 'sunday', concat('unknown_', ifNull(strings['day_type'], ''))) AS day_type,
           sum(numbers['qty']) AS qty, toFloat64(count()) AS count
    FROM temp_performance.rows_at(input_runs = {input_runs:Array(UUID)}) WHERE metric = 'demand_by_line_by_day' GROUP BY line_id, month, day_type
), combined AS (
    SELECT * FROM grouped
    UNION ALL SELECT line_id, month, 'total', sum(qty), sum(count) FROM grouped GROUP BY line_id, month
)
SELECT month AS row_date, map('line_id', line_id) AS row_properties, [formatDateTime(month, '%Y-%m'), day_type] AS row_path, map('qty', qty, 'count', count, 'avg', floor(qty / count + 0.5)) AS row_numbers, CAST(map(), 'Map(String, Nullable(String))') AS row_strings, CAST(map(), 'Map(String, Bool)') AS row_booleans, NULL AS row_scalar FROM combined
);
