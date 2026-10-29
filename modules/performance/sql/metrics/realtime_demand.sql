-- realtime_demand: publish only after this statement finishes successfully.
INSERT INTO temp_performance.metric_rows
(metric, run_id, output_date, properties, path, numbers, strings, booleans, scalar)
SELECT 'realtime_demand', {run_id:UUID}, row_date, row_properties, row_path,
       CAST(row_numbers, 'Map(String, Float64)'), CAST(row_strings, 'Map(String, Nullable(String))'),
       CAST(row_booleans, 'Map(String, Bool)'), CAST(row_scalar, 'Nullable(Float64)')
FROM (
WITH counts AS (
    SELECT agency_code AS agency,
           sumIf(passenger_qty, created_at >= {current_start:Int64} AND created_at <= {reference_at:UInt64}) AS now,
           sumIf(passenger_qty, created_at >= {previous_start:Int64} AND created_at <= {previous_until:Int64}) AS last_week
    FROM (
        SELECT agency_id, agency_code, created_at, toFloat64(1) AS passenger_qty
        FROM simplified_apex.validations FINAL WHERE is_passenger = 1
        UNION ALL
        SELECT agency_id, agency_code, created_at, toFloat64(1) AS passenger_qty
        FROM simplified_apex.banking_taps FINAL WHERE is_ok = true
    )
    WHERE agency_id IN {agency_ids:Array(String)}
      AND ((created_at >= {current_start:Int64} AND created_at <= {reference_at:UInt64})
           OR (created_at >= {previous_start:Int64} AND created_at <= {previous_until:Int64}))
    GROUP BY agency
), filled AS (
    SELECT agency, ifNull(c.now, 0) AS now, ifNull(c.last_week, 0) AS last_week
    FROM (SELECT arrayJoin({legacy_agency_ids:Array(String)}) AS agency) a LEFT JOIN counts c USING agency
), combined AS (
    SELECT agency, now, last_week FROM filled
    UNION ALL SELECT 'total', sum(now), sum(last_week) FROM filled
)
SELECT toDate('1970-01-01') AS row_date, CAST(map(), 'Map(String, String)') AS row_properties, if(agency = 'total', ['total'], ['agencies', agency]) AS row_path, map('now', now, 'last_week', last_week) AS row_numbers, CAST(map(), 'Map(String, Nullable(String))') AS row_strings, CAST(map(), 'Map(String, Bool)') AS row_booleans, NULL AS row_scalar FROM combined
);
