-- demand_affected_by_failed_circulations_by_day: publish only after this statement finishes successfully.
INSERT INTO temp_performance.metric_rows
(metric, run_id, output_date, properties, path, numbers, strings, booleans, scalar)
SELECT 'demand_affected_by_failed_circulations_by_day', {run_id:UUID}, row_date, row_properties, row_path,
       CAST(row_numbers, 'Map(String, Float64)'), CAST(row_strings, 'Map(String, Nullable(String))'),
       CAST(row_booleans, 'Map(String, Bool)'), CAST(row_scalar, 'Nullable(Float64)')
FROM (
WITH failed AS (
    SELECT DISTINCT r.agency_id, YYYYMMDDToDate(r.operational_date) AS day,
           concat(r.shape_id, '_', formatDateTime(fromUnixTimestamp64Milli(r.start_time_scheduled, 'Europe/Lisbon'), '%H:%i')) AS pattern_hour
    FROM operation.rides r FINAL
    INNER JOIN (SELECT ride_id, grade_status FROM operation.ride_analysis_simple_one_apex_validation FINAL) a ON r._id = a.ride_id
    INNER JOIN (SELECT ride_id, grade_status FROM operation.ride_analysis_simple_three_vehicle_events FINAL) v ON r._id = v.ride_id
    WHERE r.agency_id IN {agency_ids:Array(String)} AND a.grade_status = 'fail' AND v.grade_status = 'fail'
      AND r.start_time_scheduled >= toUnixTimestamp64Milli(toDateTime64(concat(toString({start_date:Date}), ' 04:00:00'), 3, 'Europe/Lisbon'))
      AND r.start_time_scheduled < toUnixTimestamp64Milli(toDateTime64(concat(toString({end_date:Date}), ' 04:00:00'), 3, 'Europe/Lisbon'))
), history AS (
    SELECT agency_id, start_time_scheduled, passengers_observed,
           concat(shape_id, '_', formatDateTime(fromUnixTimestamp64Milli(start_time_scheduled, 'Europe/Lisbon'), '%H:%i')) AS pattern_hour
    FROM operation.rides FINAL
    WHERE agency_id IN {agency_ids:Array(String)} AND passengers_observed IS NOT NULL
      AND start_time_scheduled >= toUnixTimestamp64Milli(toDateTime64(concat(toString(subtractDays({start_date:Date}, 30)), ' 04:00:00'), 3, 'Europe/Lisbon'))
      AND start_time_scheduled < toUnixTimestamp64Milli(toDateTime64(concat(toString({end_date:Date}), ' 04:00:00'), 3, 'Europe/Lisbon'))
), medians AS (
    SELECT f.agency_id, f.day, f.pattern_hour,
           if(count(h.passengers_observed) = 0, 0,
              quantilesExactInclusive(0.5)(h.passengers_observed)[1]) AS median
    FROM failed f LEFT JOIN history h
      ON f.agency_id = h.agency_id AND f.pattern_hour = h.pattern_hour
      AND h.start_time_scheduled >= toUnixTimestamp64Milli(toDateTime64(concat(toString(subtractDays(f.day, 30)), ' 04:00:00'), 3, 'Europe/Lisbon'))
      AND h.start_time_scheduled < toUnixTimestamp64Milli(toDateTime64(concat(toString(f.day), ' 04:00:00'), 3, 'Europe/Lisbon'))
    GROUP BY f.agency_id, f.day, f.pattern_hour
)
SELECT day AS row_date, map('agency_id', agency_id) AS row_properties, [formatDateTime(day, '%Y%m%d')] AS row_path, map('estimated_affected_passengers', sum(median), 'failed_circulations', toFloat64(count())) AS row_numbers, CAST(map(), 'Map(String, Nullable(String))') AS row_strings, CAST(map(), 'Map(String, Bool)') AS row_booleans, NULL AS row_scalar
FROM medians GROUP BY day, agency_id
);
