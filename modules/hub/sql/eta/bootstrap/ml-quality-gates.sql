-- Runtime accuracy circuit breaker, computed outside passenger read queries.
CREATE OR REPLACE MATERIALIZED VIEW eta.mv_ml_quality_gates
REFRESH EVERY 5 MINUTE TO eta.ml_quality_gates AS
WITH candidates AS (
    SELECT m.model_version AS model_version, m.agency_id AS agency_id, m.route_id AS route_id,
        m.ride_id AS ride_id, m.vehicle_id AS vehicle_id, m.stop_sequence AS stop_sequence,
        m.generated_at AS generated_at, m.status AS status,
        m.predicted_eta_at AS predicted_eta_at, m.fallback_eta_at AS fallback_eta_at,
        a.arrival_at AS arrival_at,
        toUInt8(multiIf((m.baseline_eta_at - m.generated_at) / 1000. <= 120, 2,
            (m.baseline_eta_at - m.generated_at) / 1000. <= 300, 5,
            (m.baseline_eta_at - m.generated_at) / 1000. <= 600, 10, 20)) AS horizon
    FROM eta.model_predictions AS m FINAL
    INNER JOIN eta.actual_arrivals AS a FINAL
        ON a.ride_id = m.ride_id AND a.vehicle_id = m.vehicle_id
        AND a.stop_sequence = m.stop_sequence AND a.label_version = 1
    WHERE m.generated_at >= toUnixTimestamp64Milli(now64(3)) - 86400000
      AND a.confidence >= 0.7 AND a.arrival_at > m.generated_at
      AND a.known_at <= toUnixTimestamp64Milli(now64(3))
    ORDER BY m.scored_at DESC
    LIMIT 1 BY m.model_version, m.ride_id, m.vehicle_id, m.stop_sequence, horizon
), errors AS (
    SELECT *, arrayJoin([toUInt8(0), horizon]) AS horizon_minutes,
        abs((fallback_eta_at - arrival_at) / 1000.) AS baseline_error,
        if(status = 'ok', abs((predicted_eta_at - arrival_at) / 1000.), NULL) AS model_error
    FROM candidates
)
SELECT model_version, agency_id, route_id, horizon_minutes,
    toUInt32(count()) AS samples, toUInt32(uniqExact(ride_id)) AS independent_rides,
    count(model_error) / count() AS coverage,
    avg(baseline_error) AS baseline_mae, coalesce(avg(model_error), 1e9) AS model_mae,
    quantileExact(0.9)(baseline_error) AS baseline_p90,
    coalesce(quantileExact(0.9)(model_error), 1e9) AS model_p90,
    toUInt8(samples >= 100 AND independent_rides >= 30 AND coverage >= 0.95
        AND model_mae <= baseline_mae * 1.05 + 5.
        AND model_p90 <= baseline_p90 * 1.05 + 5.) AS passed,
    toUnixTimestamp64Milli(now64(3)) AS refreshed_at
FROM errors
GROUP BY model_version, agency_id, route_id, horizon_minutes;
