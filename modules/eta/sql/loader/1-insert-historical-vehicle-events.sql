INSERT INTO eta.hist_vehicle_events
WITH
    rides AS (
        SELECT
            _id AS ride_id,
            trip_id,
            hashed_shape_id,
            greatest(start_time_observed, start_time_scheduled) AS ride_start,
            end_time_observed AS ride_end
        FROM eta.hist_rides
        WHERE
            end_time_observed >= {chunk_start}
            AND greatest(start_time_observed, start_time_scheduled) < {chunk_end}
    ),
    events AS (
        SELECT
            _id,
            created_at,
            agency_id,
            trip_id,
            latitude,
            longitude,
            vehicle_id
        FROM operation.simplified_vehicle_events
        WHERE
            created_at >= {chunk_start}
            AND created_at < {chunk_end}
            AND trip_id IN (SELECT DISTINCT trip_id FROM rides)
    ),
    existing_ids AS (
        SELECT _id
        FROM eta.hist_vehicle_events
        WHERE
            created_at >= {chunk_start}
            AND created_at < {chunk_end}
    )
SELECT
    sve._id,
    sve.created_at,
    sve.agency_id,
    hr.ride_id,
    sve.trip_id,
    hr.hashed_shape_id,
    sve.latitude,
    sve.longitude,
    sve.vehicle_id
FROM events sve
INNER JOIN rides hr
    ON sve.trip_id = hr.trip_id
WHERE
    sve.created_at >= hr.ride_start
    AND sve.created_at <= hr.ride_end
    AND sve._id NOT IN (SELECT _id FROM existing_ids)
SETTINGS join_algorithm = 'partial_merge';