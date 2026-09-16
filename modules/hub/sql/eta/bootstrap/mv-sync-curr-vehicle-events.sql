-- Live vehicle positions and snapper MV.
-- Depends: eta.curr_rides, eta.hist_shape_nodes; source operation.simplified_vehicle_events.

CREATE TABLE IF NOT EXISTS eta.curr_vehicle_events
(
    _id String,
    agency_id String,
    trip_id String,
    vehicle_id String,
    hashed_shape_id String,
    node_index UInt32,
    latitude Float64,
    longitude Float64,
    speed Nullable(Int64),
    bearing Nullable(Int64),
    created_at Int64,
    received_at Int64
)
ENGINE = ReplacingMergeTree()
ORDER BY (created_at, vehicle_id, trip_id, _id);

-- Snaps each ingested vehicle event to the closest shape node of its trip's
-- shape (trip -> shape from curr_rides).
--
-- Refreshable (batched) instead of insert-triggered: the tracker streams flush
-- ~6 small inserts/s and an insert-triggered MV would rebuild the join hash
-- tables on each one. 15 s keeps the batch cheap and still well inside the
-- 30 s cadence of the ETA view that consumes this table.
--
-- The snap uses the same geohash-6 bucketing as the historical build: a ping is
-- compared only with nodes of its shape inside the cells its ±0.001° bbox
-- touches (~30 candidates instead of ~700 per shape). Pings more than ~110 m
-- from their shape therefore get no node and are not ingested; they were never
-- usable for an ETA anyway.
--
-- Each refresh takes events received after the newest one already snapped,
-- minus a 60 s overlap (the tracker streams insert independently, so an event
-- can land after a newer one was already processed). The overlap is deduped on
-- _id. The 10-minute floor bounds the catch-up work after a bootstrap or a
-- refresh outage.
CREATE OR REPLACE MATERIALIZED VIEW eta.mv_curr_vehicle_events
REFRESH EVERY 15 SECOND APPEND TO eta.curr_vehicle_events AS
WITH
    0.001 AS bbox_deg,
    since AS (
        SELECT greatest(max(received_at), toUnixTimestamp64Milli(now64(3)) - 10 * 60 * 1000) - 60 * 1000 AS ms
        FROM eta.curr_vehicle_events
    ),
    fresh_events AS (
        SELECT
            _id,
            agency_id,
            trip_id,
            vehicle_id,
            latitude,
            longitude,
            speed,
            bearing,
            created_at,
            received_at,
            arrayJoin(
                geohashesInBox(
                    toFloat32(longitude - bbox_deg),
                    toFloat32(latitude  - bbox_deg),
                    toFloat32(longitude + bbox_deg),
                    toFloat32(latitude  + bbox_deg),
                    6
                )
            ) AS cell
        FROM operation.simplified_vehicle_events
        -- operational_date is in the partition/primary key: prunes the scan to the current day(s).
        WHERE operational_date >= toYYYYMMDD(today() - 1)
          AND received_at > (SELECT ms FROM since)
          AND _id NOT IN (SELECT _id FROM eta.curr_vehicle_events WHERE received_at > (SELECT ms FROM since))
    )
SELECT
    s._id AS _id,
    s.agency_id AS agency_id,
    s.trip_id AS trip_id,
    s.vehicle_id AS vehicle_id,
    d.hashed_shape_id AS hashed_shape_id,
    argMin(n.node_index, greatCircleDistance(s.longitude, s.latitude, n.longitude, n.latitude)) AS node_index,
    s.latitude AS latitude,
    s.longitude AS longitude,
    s.speed AS speed,
    s.bearing AS bearing,
    s.created_at AS created_at,
    s.received_at AS received_at
FROM fresh_events AS s
INNER JOIN eta.curr_rides AS d ON s.trip_id = d.trip_id
INNER JOIN eta.hist_shape_nodes AS n
    ON  d.hashed_shape_id = n.hashed_shape_id
    AND s.cell            = n.geohash
    AND n.latitude  BETWEEN s.latitude  - bbox_deg AND s.latitude  + bbox_deg
    AND n.longitude BETWEEN s.longitude - bbox_deg AND s.longitude + bbox_deg
GROUP BY
    s._id,
    s.agency_id,
    s.trip_id,
    s.vehicle_id,
    d.hashed_shape_id,
    s.latitude,
    s.longitude,
    s.speed,
    s.bearing,
    s.created_at,
    s.received_at;
