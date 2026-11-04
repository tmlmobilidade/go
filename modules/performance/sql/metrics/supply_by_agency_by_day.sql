-- supply_by_agency_by_day: publish only after this statement finishes successfully.
INSERT INTO temp_performance.metric_rows
(metric, run_id, output_date, properties, path, numbers, strings, booleans, scalar)
SELECT 'supply_by_agency_by_day', {run_id:UUID}, row_date, row_properties, row_path,
       CAST(row_numbers, 'Map(String, Float64)'), CAST(row_strings, 'Map(String, Nullable(String))'),
       CAST(row_booleans, 'Map(String, Bool)'), CAST(row_scalar, 'Nullable(Float64)')
FROM (
WITH rides AS (
    SELECT r.*, YYYYMMDDToDate(r.operational_date) AS day,
           (ifNull(a.grade_status = 'pass', false) OR ifNull(apex_validations_qty, 0) > 0
            OR ifNull(apex_sales_qty, 0) > 0 OR ifNull(passengers_observed, 0) > 0) AS is_valid
    FROM operation.rides r FINAL
    LEFT JOIN (SELECT ride_id, grade_status FROM operation.ride_analysis_simple_three_vehicle_events FINAL WHERE agency_id IN {agency_ids:Array(String)}) a ON r._id = a.ride_id
    WHERE r.agency_id IN {agency_ids:Array(String)} AND YYYYMMDDToDate(r.operational_date) BETWEEN {start_date:Date} AND {end_date:Date}
), counts AS (
    SELECT day, agency_id, toFloat64(count()) AS scheduled_rides,
           toFloat64(countIf(is_valid)) AS accomplished_rides,
           toFloat64(sumIf(extension_scheduled, is_valid)) AS vkms_observed,
           toFloat64(sum(extension_scheduled)) AS vkms_scheduled,
           sum(ifNull(apex_sales_amount, 0) / 100.0 + ifNull(passengers_observed_prepaid_amount, 0) / 100.0
               + ifNull(passengers_observed_subscription_qty, 0)) AS revenue_per_trip
    FROM rides GROUP BY day, agency_id
)
SELECT day AS row_date, map('agency_id', counts.agency_id) AS row_properties, [toString(day)] AS row_path, map('scheduled_rides', scheduled_rides, 'accomplished_rides', accomplished_rides, 'vkms_observed', vkms_observed, 'vkms_scheduled', vkms_scheduled, 'revenue_per_trip', revenue_per_trip, 'cost_per_trip', vkms_scheduled * ifNull(a.price_per_km, 0) / 1000) AS row_numbers, map('day_type', c.day_type, 'period', c.period, 'notes', c.notes, 'holiday', c.holiday) AS row_strings, CAST(map(), 'Map(String, Bool)') AS row_booleans, NULL AS row_scalar
FROM counts
INNER JOIN (SELECT * FROM temp_performance.calendar WHERE run_id IN {input_runs:Array(UUID)}) c ON counts.day = c.date
LEFT JOIN (SELECT * FROM temp_performance.agencies WHERE run_id IN {input_runs:Array(UUID)}) a ON counts.agency_id = a.agency_id
);
