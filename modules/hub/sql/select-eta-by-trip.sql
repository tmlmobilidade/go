SELECT
    trip_id AS key,
    toJSONString(
        arraySort(
            x -> toUInt16(x['stop_sequence']),
            groupArray(
                map(
                    'trip_id', trip_id,
                    'vehicle_id', vehicle_id,
                    'hashed_trip_id', hashed_trip_id,
                    'hashed_shape_id', hashed_shape_id,
                    'current_node_index', toString(current_node_index),
                    'position_created_at', toString(position_created_at),
                    'stop_sequence', toString(stop_sequence),
                    'stop_id', stop_id,
                    'stop_name', stop_name,
                    'stop_node_index', stop_node_index,
                    'eta_seconds', toString(eta_seconds),
                    'eta_at', toString(eta_at),
                    'refreshed_at', toString(refreshed_at)
                )
            )
        )
    ) AS value
FROM eta.pred_trip_stop_etas
FINAL
GROUP BY trip_id
ORDER BY key;