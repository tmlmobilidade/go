WITH latest AS (
    SELECT agency_id, ride_id, vehicle_id, max(created_at) AS created_at,
        argMax(received_at, tuple(created_at,_id)) AS received_at
    FROM eta.curr_vehicle_events FINAL
    WHERE ride_id != '' GROUP BY agency_id, ride_id, vehicle_id
)
SELECT agency_id, count() AS tracked_vehicles,
    quantiles(0.5,0.9,0.99)((toUnixTimestamp64Milli(now64(3))-created_at)/1000.) AS gps_age_seconds,
    quantiles(0.5,0.9,0.99)((received_at-created_at)/1000.) AS ingestion_lag_seconds,
    countIf(created_at < toUnixTimestamp64Milli(now64(3)) - (SELECT max_gps_seconds FROM eta.policy)*1000) / count() AS stale_fraction
FROM latest GROUP BY agency_id;
