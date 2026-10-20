-- demand_by_product_by_agency_by_day: publish only after this statement finishes successfully.
INSERT INTO temp_performance.metric_rows
(metric, run_id, output_date, properties, path, numbers, strings, booleans, scalar)
SELECT 'demand_by_product_by_agency_by_day', {run_id:UUID}, row_date, row_properties, row_path,
       CAST(row_numbers, 'Map(String, Float64)'), CAST(row_strings, 'Map(String, Nullable(String))'),
       CAST(row_booleans, 'Map(String, Bool)'), CAST(row_scalar, 'Nullable(Float64)')
FROM (
WITH counts AS (
    SELECT if(toHour(local_time) < 4, subtractDays(toDate(local_time), 1), toDate(local_time)) AS day,
           ifNull(v.agency_code, 'no-agency') AS dimension, ifNull(v.product_id, 'unknown-product') AS extra_dimension, toFloat64(count()) AS qty
    FROM (SELECT *, fromUnixTimestamp64Milli(created_at, 'Europe/Lisbon') AS local_time FROM simplified_apex.validations FINAL) AS v
    WHERE agency_id IN {agency_ids:Array(String)} AND is_passenger = 1
      AND created_at >= toUnixTimestamp64Milli(toDateTime64(concat(toString({start_date:Date}), ' 04:00:00'), 3, 'Europe/Lisbon'))
      AND created_at < toUnixTimestamp64Milli(toDateTime64(concat(toString(addDays({end_date:Date}, 1)), ' 04:00:00'), 3, 'Europe/Lisbon'))
    GROUP BY day, dimension, extra_dimension
)
SELECT day AS row_date, map('agency_id', dimension, 'product_id', extra_dimension) AS row_properties, [toString(day)] AS row_path, map('qty', qty) AS row_numbers, map('day_type', if(empty(c.day_type), '1', c.day_type), 'period', if(empty(c.period), '1', c.period), 'notes', c.notes, 'holiday', if(empty(c.holiday), '0', c.holiday)) AS row_strings, CAST(map(), 'Map(String, Bool)') AS row_booleans, NULL AS row_scalar
FROM counts
LEFT JOIN (SELECT * FROM temp_performance.calendar WHERE run_id IN {input_runs:Array(UUID)}) AS c ON counts.day = c.date
);
