-- demand_by_pattern_hour_by_day: publish only after this statement finishes successfully.
INSERT INTO temp_performance.metric_rows
(metric, run_id, output_date, properties, path, numbers, strings, booleans, scalar)
SELECT 'demand_by_pattern_hour_by_day', {run_id:UUID}, row_date, row_properties, row_path,
       CAST(row_numbers, 'Map(String, Float64)'), CAST(row_strings, 'Map(String, Nullable(String))'),
       CAST(row_booleans, 'Map(String, Bool)'), CAST(row_scalar, 'Nullable(Float64)')
FROM (
WITH counts AS (
    SELECT if(toHour(local_time) < 4, subtractDays(toDate(local_time), 1), toDate(local_time)) AS day,
           toString(toHour(fromUnixTimestamp64Milli(start_time_scheduled, 'UTC'))) AS hour,
           toString(toMinute(fromUnixTimestamp64Milli(start_time_scheduled, 'UTC'))) AS minute,
           route_short_name AS line_id, shape_id AS pattern_id, toFloat64(sum(passengers_observed)) AS qty
    FROM (SELECT *, fromUnixTimestamp64Milli(start_time_scheduled, 'Europe/Lisbon') AS local_time FROM operation.rides FINAL)
    WHERE agency_id IN {agency_ids:Array(String)} AND passengers_observed > 0
      AND start_time_scheduled >= toUnixTimestamp64Milli(toDateTime64(concat(toString({start_date:Date}), ' 04:00:00'), 3, 'Europe/Lisbon'))
      AND start_time_scheduled < toUnixTimestamp64Milli(toDateTime64(concat(toString(addDays({end_date:Date}, 1)), ' 04:00:00'), 3, 'Europe/Lisbon'))
    GROUP BY day, hour, minute, line_id, pattern_id
)
SELECT day AS row_date, map('hour', hour, 'minute', minute, 'line_id', line_id, 'pattern_id', pattern_id) AS row_properties, [toString(day)] AS row_path, map('qty', qty) AS row_numbers, map('day_type', c.day_type, 'period', c.period, 'notes', c.notes, 'holiday', c.holiday) AS row_strings, CAST(map(), 'Map(String, Bool)') AS row_booleans, NULL AS row_scalar
FROM counts
LEFT JOIN (SELECT * FROM temp_performance.calendar WHERE run_id IN {input_runs:Array(UUID)}) c ON counts.day = c.date
WHERE throwIf(empty(c.day_type), 'Calendar entry unavailable for pattern/hour demand') = 0
);
