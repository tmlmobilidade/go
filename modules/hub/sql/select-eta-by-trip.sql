SELECT
    concat('[', plan_id, ']', '[', agency_id, ']', trip_id) AS key,
    toJSONString(
        arraySort(
            x -> toUInt16(x['stop_sequence']),
            groupArray(
                map(
                    'trip_id', concat('[', plan_id, ']', '[', agency_id, ']', trip_id),
                    'vehicle_id', vehicle_id,
                    'stop_sequence', toUInt16(stop_sequence),
                    'stop_id', stop_id,
                    'stop_name', stop_name,
                    'eta_seconds', toInt32(intDiv(eta_at - toUnixMilliseconds64Milli(now64(3)), 1000)),
                    'eta_at', toInt64(eta_at)
                )
            )
        )
    ) AS value
FROM eta.pred_trip_stop_etas
FINAL
GROUP BY plan_id, agency_id, trip_id
ORDER BY key;
