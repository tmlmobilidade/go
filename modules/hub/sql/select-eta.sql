SELECT
    concat('[', plan_id, ']', '[', agency_id, ']', trip_id) AS trip_id,
    vehicle_id,
    stop_sequence,
    stop_id,
    stop_name,
    eta_seconds,
    eta_at,
FROM eta.pred_trip_stop_etas;