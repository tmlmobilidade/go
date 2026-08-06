SELECT
    stop_id AS key,
    toJSONString(
        arraySort(
            x -> toUInt16(x['stop_sequence']),
            groupArray(
                map(
                    'trip_id', concat('[', plan_id, ']', '[', agency_id, ']', trip_id),
                    'vehicle_id', vehicle_id,
                    'stop_sequence', toString(stop_sequence),
                    'stop_id', stop_id,
                    'stop_name', stop_name,
                    'eta_seconds', toString(eta_seconds),
                    'eta_at', toString(eta_at)
                )
            )
        )
    ) AS value
FROM eta.pred_trip_stop_etas
FINAL
GROUP BY stop_id
ORDER BY key
