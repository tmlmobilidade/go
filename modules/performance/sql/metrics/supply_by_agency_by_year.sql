-- supply_by_agency_by_year: publish only after this statement finishes successfully.
INSERT INTO temp_performance.metric_rows
(metric, run_id, output_date, properties, path, numbers, strings, booleans, scalar)
SELECT 'supply_by_agency_by_year', {run_id:UUID}, row_date, row_properties, row_path,
       CAST(row_numbers, 'Map(String, Float64)'), CAST(row_strings, 'Map(String, Nullable(String))'),
       CAST(row_booleans, 'Map(String, Bool)'), CAST(row_scalar, 'Nullable(Float64)')
FROM (
SELECT toStartOfYear(output_date) AS row_date, properties AS row_properties, [toString(toYear(row_date))] AS row_path, map('scheduled_rides', sum(numbers['scheduled_rides']), 'accomplished_rides', sum(numbers['accomplished_rides']), 'vkms_observed', sum(numbers['vkms_observed']), 'vkms_scheduled', sum(numbers['vkms_scheduled']), 'revenue_per_trip', sum(numbers['revenue_per_trip']), 'cost_per_trip', sum(numbers['cost_per_trip'])) AS row_numbers, CAST(map(), 'Map(String, Nullable(String))') AS row_strings, CAST(map(), 'Map(String, Bool)') AS row_booleans, NULL AS row_scalar FROM temp_performance.rows_at(input_runs = {input_runs:Array(UUID)}) WHERE metric = 'supply_by_agency_by_month' GROUP BY row_date, properties
);
