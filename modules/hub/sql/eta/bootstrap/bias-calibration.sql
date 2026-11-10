-- Recompute a bounded window instead of mutating online state per message.
-- Retries, duplicate labels and correlated refreshes cannot increment it twice.
CREATE OR REPLACE MATERIALIZED VIEW eta.mv_bias_calibration
REFRESH EVERY 1 MINUTE TO eta.bias_calibration AS
WITH
    toUnixTimestamp64Milli(now64(3)) AS now_ms,
    candidates AS (
        SELECT ride_id, vehicle_id, agency_id, route_id, generated_at,
            actual_arrival_at, toUInt8(intDiv(toHour(fromUnixTimestamp64Milli(generated_at, 'Europe/Lisbon')), 2)) AS local_period,
            candidate.1 AS source,
            (candidate.2 - actual_arrival_at) / 1000. AS error_seconds,
            (candidate.2 - generated_at) / 1000. AS horizon_seconds,
            toUInt8(multiIf(horizon_seconds <= 120, 2, horizon_seconds <= 300, 5,
                horizon_seconds <= 600, 10, 20)) AS horizon_minutes
        FROM eta.prediction_errors
        ARRAY JOIN [tuple('baseline', baseline_eta_at), tuple('traffic', traffic_eta_at)] AS candidate
        WHERE generated_at >= now_ms - 7 * 86400000
          AND has_label AND label_known_at <= now_ms
          AND candidate.2 IS NOT NULL AND actual_arrival_at <= now_ms
          AND horizon_seconds > 0 AND horizon_seconds <= 1200
    ),
    independent AS (
        SELECT * FROM candidates
        ORDER BY abs(horizon_seconds - horizon_minutes * 60) ASC, generated_at DESC
        LIMIT 1 BY source, ride_id, vehicle_id, horizon_minutes
    ),
    hierarchy AS (
        SELECT source, cohort.1 AS scope, cohort.2 AS agency_id, cohort.3 AS route_id,
            local_period, horizon_minutes, error_seconds, actual_arrival_at,
            exp(-greatest(0., (now_ms - actual_arrival_at) / 1000.) / 21600.) AS weight
        FROM independent AS i
        ARRAY JOIN [tuple('route', i.agency_id, i.route_id), tuple('agency', i.agency_id, ''), tuple('global', '', '')] AS cohort
    )
SELECT source, scope, agency_id, route_id, local_period, horizon_minutes,
    greatest(-120., least(120., sum(greatest(-600., least(600., error_seconds)) * weight) /
        (sum(weight) + 20.))) AS bias_seconds,
    toUInt32(count()) AS independent_rides, sum(weight) AS effective_support,
    max(actual_arrival_at) AS last_arrival_at, now_ms AS refreshed_at
FROM hierarchy
GROUP BY source, scope, agency_id, route_id, local_period, horizon_minutes;

