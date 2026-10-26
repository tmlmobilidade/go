-- top_mean_demand_by_line_by_month: publish only after this statement finishes successfully.
INSERT INTO temp_performance.metric_rows
(metric, run_id, output_date, properties, path, numbers, strings, booleans, scalar)
SELECT 'top_mean_demand_by_line_by_month', {run_id:UUID}, row_date, row_properties, row_path,
       CAST(row_numbers, 'Map(String, Float64)'), CAST(row_strings, 'Map(String, Nullable(String))'),
       CAST(row_booleans, 'Map(String, Bool)'), CAST(row_scalar, 'Nullable(Float64)')
FROM (
WITH means AS (
    SELECT properties['line_id'] AS line_id, output_date AS month, numbers['qty'] AS qty
    FROM temp_performance.rows_at(input_runs = {input_runs:Array(UUID)}) WHERE metric = 'mean_demand_by_line_by_month' AND path[2] = 'total'
), averages AS (
    SELECT *, avg(qty) OVER (PARTITION BY line_id, toYear(month) ORDER BY month ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS year_avg
    FROM means
), ranked AS (
    SELECT *, if(year_avg = 0, 0, (qty / year_avg - 1) * 100) AS increase,
           row_number() OVER (PARTITION BY month ORDER BY increase DESC, line_id) AS rank
    FROM averages WHERE qty != 0
)
SELECT month AS row_date, map('year_month', formatDateTime(month, '%Y-%m')) AS row_properties, [line_id] AS row_path, map('increase_pct', round(increase, 2), 'qty', floor(qty + 0.5), 'year_avg', floor(year_avg + 0.5)) AS row_numbers, CAST(map(), 'Map(String, Nullable(String))') AS row_strings, CAST(map(), 'Map(String, Bool)') AS row_booleans, NULL AS row_scalar FROM ranked WHERE rank <= 10
UNION ALL
SELECT month AS row_date, map('year_month', formatDateTime(month, '%Y-%m')) AS row_properties, [] AS row_path, CAST(map(), 'Map(String, Float64)') AS row_numbers, CAST(map(), 'Map(String, Nullable(String))') AS row_strings, CAST(map(), 'Map(String, Bool)') AS row_booleans, NULL AS row_scalar FROM (SELECT DISTINCT month FROM means)
);
