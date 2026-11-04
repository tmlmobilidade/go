-- realtime_service_compliance: publish only after this statement finishes successfully.
INSERT INTO temp_performance.metric_rows
(metric, run_id, output_date, properties, path, numbers, strings, booleans, scalar)
SELECT 'realtime_service_compliance', {run_id:UUID}, row_date, row_properties, row_path,
       CAST(row_numbers, 'Map(String, Float64)'), CAST(row_strings, 'Map(String, Nullable(String))'),
       CAST(row_booleans, 'Map(String, Bool)'), CAST(row_scalar, 'Nullable(Float64)')
FROM (
WITH rides AS (
    SELECT r.*, ifNull(v.grade_status = 'pass', false) AS is_valid, s.observed_start_time_delta AS delay,
           if(r.operational_date = {current_date:UInt32}, 'now', 'last_week') AS mode
    FROM operation.rides r FINAL
    LEFT JOIN (SELECT ride_id, grade_status FROM operation.ride_analysis_simple_three_vehicle_events FINAL WHERE agency_id IN {agency_ids:Array(String)} AND operational_date IN ({current_date:UInt32}, {previous_date:UInt32})) v ON r._id = v.ride_id
    LEFT JOIN (SELECT ride_id, observed_start_time_delta FROM operation.ride_analysis_expected_start_time FINAL WHERE agency_id IN {agency_ids:Array(String)} AND operational_date IN ({current_date:UInt32}, {previous_date:UInt32})) s ON r._id = s.ride_id
    WHERE r.agency_id IN {agency_ids:Array(String)} AND r.processing_status = 'complete'
      AND ((r.operational_date = {current_date:UInt32} AND r.start_time_scheduled <= {reference_at:UInt64} - 300000)
           OR (r.operational_date = {previous_date:UInt32} AND r.start_time_scheduled <= {previous_until:Int64} - 300000 AND r.start_time_observed <= {previous_until:Int64}))
), counts AS (
    SELECT agency_id AS agency, mode, toFloat64(count()) AS scheduled_rides,
       toFloat64(countIf(passengers_observed > 0)) AS rides_with_sales,
       toFloat64(countIf(passengers_observed > 0 OR is_valid)) AS accomplished_rides,
       toFloat64(countIf(is_valid)) AS valid_rides,
       toFloat64(countIf(is_valid AND passengers_observed = 0)) AS no_passengers_rides,
       toFloat64(countIf(is_valid AND delay <= -1)) AS advanced_rides,
       toFloat64(countIf(is_valid AND start_time_observed != 0 AND delay > 5)) AS five_min_delays,
       toFloat64(sumIf(ifNull(delay, 0), is_valid AND start_time_observed != 0 AND delay >= 0)) AS mean_delay_minutes FROM rides GROUP BY agency_id, mode
), filled AS (
    SELECT a.agency, a.mode, ifNull(c.scheduled_rides, 0) AS scheduled_rides, ifNull(c.rides_with_sales, 0) AS rides_with_sales, ifNull(c.accomplished_rides, 0) AS accomplished_rides, ifNull(c.valid_rides, 0) AS valid_rides, ifNull(c.no_passengers_rides, 0) AS no_passengers_rides, ifNull(c.advanced_rides, 0) AS advanced_rides, ifNull(c.five_min_delays, 0) AS five_min_delays, ifNull(c.mean_delay_minutes, 0) AS mean_delay_minutes
    FROM (SELECT arrayJoin({agency_ids:Array(String)}) AS agency, arrayJoin(['now', 'last_week']) AS mode) a
    LEFT JOIN counts c ON a.agency = c.agency AND a.mode = c.mode
), combined AS (
    SELECT * FROM filled
    UNION ALL SELECT 'total', mode, sum(scheduled_rides), sum(rides_with_sales), sum(accomplished_rides), sum(valid_rides), sum(no_passengers_rides), sum(advanced_rides), sum(five_min_delays), sum(mean_delay_minutes) FROM filled GROUP BY mode
), exploded AS (
    SELECT *, arrayJoin(['scheduled_rides', 'rides_with_sales', 'accomplished_rides', 'valid_rides', 'no_passengers_rides', 'advanced_rides', 'five_min_delays', 'mean_delay_minutes']) AS key,
           map('scheduled_rides', scheduled_rides, 'rides_with_sales', rides_with_sales, 'accomplished_rides', accomplished_rides, 'valid_rides', valid_rides, 'no_passengers_rides', no_passengers_rides, 'advanced_rides', advanced_rides, 'five_min_delays', five_min_delays, 'mean_delay_minutes', mean_delay_minutes) AS metrics FROM combined
)
SELECT toDate('1970-01-01') AS row_date, CAST(map(), 'Map(String, String)') AS row_properties, if(agency = 'total', ['total', key], ['agencies', agency, key]) AS row_path, map(mode, if(key = 'mean_delay_minutes', if(scheduled_rides = 0, 0, round(metrics[key] / scheduled_rides, 2)), metrics[key])) AS row_numbers, CAST(map(), 'Map(String, Nullable(String))') AS row_strings, CAST(map(), 'Map(String, Bool)') AS row_booleans, NULL AS row_scalar FROM exploded
);
