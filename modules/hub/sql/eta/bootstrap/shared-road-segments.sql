-- Cache tangents once per loader cycle, not once per live GPS batch.
CREATE TABLE IF NOT EXISTS eta.cached_shape_node_geometry
(
    hashed_shape_id String, node_index UInt32, latitude Float64, longitude Float64,
    geohash String, heading_degrees Float64
)
ENGINE = MergeTree ORDER BY (hashed_shape_id, node_index);

CREATE OR REPLACE MATERIALIZED VIEW eta.mv_cached_shape_node_geometry
REFRESH EVERY 15 MINUTE TO eta.cached_shape_node_geometry AS
SELECT * FROM eta.shape_node_geometry
WHERE hashed_shape_id IN (SELECT hashed_shape_id FROM eta.curr_rides FINAL);

-- A geohash-7 cell is ~100-150 m here. It is a REVIEW candidate, not road
-- topology: coordinates cannot distinguish a bridge from the road below it.
CREATE OR REPLACE VIEW eta.road_segment_candidates AS
SELECT hashed_shape_id, node_index, latitude, longitude, heading_degrees,
    geohashEncode(longitude, latitude, 7) AS cell,
    toUInt8(floor(heading_degrees / 15.)) AS direction_bin,
    hex(SHA256(concat('candidate-v1:', cell, ':', toString(direction_bin)))) AS candidate_id
FROM eta.cached_shape_node_geometry;

-- Reviewed assignments or an authoritative road-graph import must specify
-- road segment AND grade/layer. Segment refs should cover ~100-250 m.
CREATE TABLE IF NOT EXISTS eta.road_segment_assignments
(
    hashed_shape_id String, node_index UInt32,
    road_segment_ref String, road_layer String,
    mapping_version String, approved UInt8,
    reviewed_by String, updated_at Int64
)
ENGINE = ReplacingMergeTree(updated_at)
ORDER BY (mapping_version, hashed_shape_id, node_index);

CREATE OR REPLACE VIEW eta.shape_node_road_segments AS
SELECT a.hashed_shape_id AS hashed_shape_id, a.node_index AS node_index,
    a.mapping_version AS mapping_version,
    hex(SHA256(toJSONString(tuple(a.mapping_version, a.road_segment_ref, a.road_layer,
        toUInt8(floor(g.heading_degrees / 15.)))))) AS segment_id,
    g.latitude AS latitude, g.longitude AS longitude,
    g.heading_degrees AS heading_degrees
FROM eta.road_segment_assignments AS a FINAL
INNER JOIN eta.cached_shape_node_geometry AS g
    ON g.hashed_shape_id = a.hashed_shape_id AND g.node_index = a.node_index
WHERE a.approved = 1 AND a.mapping_version = 'road-v1'
  AND a.road_segment_ref != '' AND a.road_layer != '' AND a.reviewed_by != '';
