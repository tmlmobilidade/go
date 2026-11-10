-- Forward tangent with a backward tangent at the terminal node. Bearings use
-- the vehicle convention: clockwise degrees from north, wrapped at 360.
CREATE OR REPLACE VIEW eta.shape_node_geometry AS
WITH adjacent AS (
    SELECT *,
        leadInFrame(latitude, 1, latitude) OVER w AS next_lat,
        leadInFrame(longitude, 1, longitude) OVER w AS next_lon,
        lagInFrame(latitude, 1, latitude) OVER w AS prev_lat,
        lagInFrame(longitude, 1, longitude) OVER w AS prev_lon
    FROM eta.hist_shape_nodes FINAL
    WINDOW w AS (PARTITION BY hashed_shape_id ORDER BY node_index
                 ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)
)
SELECT hashed_shape_id, node_index, latitude, longitude, geohash,
    modulo(atan2(
        if(next_lon = longitude AND next_lat = latitude, longitude - prev_lon, next_lon - longitude) * cos(latitude * pi() / 180.),
        if(next_lon = longitude AND next_lat = latitude, latitude - prev_lat, next_lat - latitude)
    ) * 180. / pi() + 360., 360.) AS heading_degrees
FROM adjacent;

