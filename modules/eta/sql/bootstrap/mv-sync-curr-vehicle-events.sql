-- Live vehicle positions and snapper MV.
-- Depends: {database}.curr_rides, {database}.hist_shape_nodes; source operation.simplified_vehicle_events.

CREATE TABLE IF NOT EXISTS {database}.curr_vehicle_events
(
    _id String,
    trip_id String,
    vehicle_id String,
    hashed_shape_id String,
    node_index UInt32,
    latitude Float64,
    longitude Float64,
    speed Nullable(Int64),
    bearing Nullable(Int64),
    created_at Int64
)
ENGINE = ReplacingMergeTree()
ORDER BY (created_at, vehicle_id, trip_id, _id);

-- Snaps each ingested vehicle event to the closest shape node per trip (trip->shape from daily_rides).
CREATE MATERIALIZED VIEW IF NOT EXISTS {database}.mv_curr_vehicle_events
TO {database}.curr_vehicle_events AS
SELECT
    s._id AS _id,
    s.trip_id AS trip_id,
    s.vehicle_id AS vehicle_id,
    d.hashed_shape_id AS hashed_shape_id,
    argMin(n.node_index, greatCircleDistance(s.longitude, s.latitude, n.longitude, n.latitude)) AS node_index,
    s.latitude AS latitude,
    s.longitude AS longitude,
    s.speed AS speed,
    s.bearing AS bearing,
    s.created_at AS created_at
FROM operation.simplified_vehicle_events AS s
INNER JOIN {database}.curr_rides AS d ON s.trip_id = d.trip_id
INNER JOIN {database}.hist_shape_nodes AS n ON d.hashed_shape_id = n.hashed_shape_id
GROUP BY
    s._id,
    s.trip_id,
    s.vehicle_id,
    d.hashed_shape_id,
    s.latitude,
    s.longitude,
    s.speed,
    s.bearing,
    s.created_at;
