SELECT
    (SELECT count() FROM eta.cached_shape_node_geometry) AS active_nodes,
    count() AS approved_nodes, uniqExact(hashed_shape_id) AS shapes,
    uniqExact(segment_id) AS directional_segments,
    approved_nodes / nullIf(active_nodes, 0) AS coverage
FROM eta.shape_node_road_segments;
