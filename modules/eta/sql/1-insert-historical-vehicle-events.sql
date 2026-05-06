-- =============================================================================
-- Incremental load: vehicle pings that fall inside historical rides' windows
-- into eta.hist_vehicle_events.
--
-- Source : operation.simplified_vehicle_events × eta.hist_rides
-- Target : eta.hist_vehicle_events (ReplacingMergeTree; dedup by _id)
--
-- Time window for raw events is computed once from eta.hist_rides; the large
-- simplified_vehicle_events scan is restricted to that window before joining.
-- Rows already in the target are skipped (LEFT ANTI JOIN on _id).
-- =============================================================================

INSERT INTO eta.hist_vehicle_events
WITH
    ride_time_bounds AS (
        SELECT
            min(greatest(start_time_observed, start_time_scheduled)) AS window_start_ms,
            max(end_time_observed) AS window_end_ms
        FROM eta.hist_rides
    )
SELECT
    sve._id,
    sve.created_at,
    sve.agency_id,
    hr._id AS ride_id,
    sve.trip_id,
    hr.hashed_shape_id,
    sve.latitude,
    sve.longitude,
    sve.vehicle_id
FROM
(
    SELECT
        sve_inner._id,
        sve_inner.created_at,
        sve_inner.agency_id,
        sve_inner.trip_id,
        sve_inner.latitude,
        sve_inner.longitude,
        sve_inner.vehicle_id
    FROM operation.simplified_vehicle_events AS sve_inner
    CROSS JOIN ride_time_bounds AS b
    WHERE
        sve_inner.created_at >= b.window_start_ms
        AND sve_inner.created_at <= b.window_end_ms
) AS sve
INNER JOIN eta.hist_rides AS hr
    ON sve.trip_id = hr.trip_id
    AND sve.created_at >= greatest(hr.start_time_observed, hr.start_time_scheduled)
    AND sve.created_at <= hr.end_time_observed
LEFT ANTI JOIN eta.hist_vehicle_events AS hve
    ON sve._id = hve._id;
