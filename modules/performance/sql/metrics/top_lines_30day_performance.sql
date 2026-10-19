-- top_lines_30day_performance: publish only after this statement finishes successfully.
INSERT INTO temp_performance.metric_rows
(metric, run_id, output_date, properties, path, numbers, strings, booleans, scalar)
SELECT 'top_lines_30day_performance', {run_id:UUID}, row_date, row_properties, row_path,
       CAST(row_numbers, 'Map(String, Float64)'), CAST(row_strings, 'Map(String, Nullable(String))'),
       CAST(row_booleans, 'Map(String, Bool)'), CAST(row_scalar, 'Nullable(Float64)')
FROM (
WITH stats AS (
    SELECT properties['line_id'] AS line_id,
           sumIf(numbers['qty'], output_date >= subtractDays({end_date:Date}, 30)) AS recent_total,
           countIf(output_date >= subtractDays({end_date:Date}, 30)) AS recent_count,
           avg(numbers['qty']) AS baseline_avg,
           sumIf(numbers['qty'], output_date >= subtractDays({end_date:Date}, 30) AND strings['day_type'] = '1') AS type_1,
           sumIf(numbers['qty'], output_date >= subtractDays({end_date:Date}, 30) AND strings['day_type'] = '2') AS type_2,
           sumIf(numbers['qty'], output_date >= subtractDays({end_date:Date}, 30) AND strings['day_type'] = '3') AS type_3
    FROM temp_performance.rows_at(input_runs = {input_runs:Array(UUID)}) WHERE metric = 'demand_by_line_by_day'
      AND output_date BETWEEN subtractYears({end_date:Date}, 1) AND {end_date:Date}
    GROUP BY line_id HAVING recent_count >= 15 AND baseline_avg >= 10
), ranked AS (
    SELECT *, round((recent_total / recent_count / baseline_avg - 1) * 100, 2) AS increase_pct,
           row_number() OVER (ORDER BY increase_pct DESC, line_id) AS best,
           row_number() OVER (ORDER BY increase_pct ASC, line_id DESC) AS worst
    FROM stats
), selected AS (
    SELECT *, 'top_performers' AS section FROM ranked WHERE best <= 10
    UNION ALL SELECT *, 'worst_performers' AS section FROM ranked WHERE worst <= 10
)
SELECT toDate('1970-01-01') AS row_date, CAST(map(), 'Map(String, String)') AS row_properties, [section, line_id] AS row_path, map('increase_pct', increase_pct, 'last_30_days_total', recent_total, 'ytd_avg', floor(baseline_avg + 0.5)) AS row_numbers, CAST(map(), 'Map(String, Nullable(String))') AS row_strings, CAST(map(), 'Map(String, Bool)') AS row_booleans, NULL AS row_scalar FROM selected
UNION ALL
SELECT toDate('1970-01-01') AS row_date, CAST(map(), 'Map(String, String)') AS row_properties, [section, line_id, 'last_30_days_by_day_type'] AS row_path, map('day_type_1', type_1, 'day_type_2', type_2, 'day_type_3', type_3) AS row_numbers, CAST(map(), 'Map(String, Nullable(String))') AS row_strings, CAST(map(), 'Map(String, Bool)') AS row_booleans, NULL AS row_scalar FROM selected
UNION ALL SELECT toDate('1970-01-01') AS row_date, CAST(map(), 'Map(String, String)') AS row_properties, ['top_performers'] AS row_path, CAST(map(), 'Map(String, Float64)') AS row_numbers, CAST(map(), 'Map(String, Nullable(String))') AS row_strings, CAST(map(), 'Map(String, Bool)') AS row_booleans, NULL AS row_scalar
UNION ALL SELECT toDate('1970-01-01') AS row_date, CAST(map(), 'Map(String, String)') AS row_properties, ['worst_performers'] AS row_path, CAST(map(), 'Map(String, Float64)') AS row_numbers, CAST(map(), 'Map(String, Nullable(String))') AS row_strings, CAST(map(), 'Map(String, Bool)') AS row_booleans, NULL AS row_scalar
);
