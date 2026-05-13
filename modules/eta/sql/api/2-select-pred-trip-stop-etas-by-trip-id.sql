SELECT
    trip_id,
    vehicle_id,
    hashed_trip_id,
    hashed_shape_id,
    current_node_index,
    position_created_at,
    stop_sequence,
    stop_id,
    stop_name,
    stop_node_index,
    eta_seconds,
    eta_at,
    refreshed_at
FROM eta.pred_trip_stop_etas
WHERE trip_id = {trip_id:String}
ORDER BY stop_sequence
