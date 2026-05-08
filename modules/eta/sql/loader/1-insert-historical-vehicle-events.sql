INSERT INTO eta.hist_vehicle_events
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
FROM eta.hist_rides hr
INNER JOIN operation.simplified_vehicle_events sve
    ON sve.trip_id = hr.trip_id
WHERE
    sve.created_at BETWEEN
        greatest(hr.start_time_observed, hr.start_time_scheduled)
        AND hr.end_time_observed
    AND NOT EXISTS
    (
        SELECT 1
        FROM eta.hist_vehicle_events hve
        WHERE hve._id = sve._id
    );