WITH trip_summary AS (
    SELECT
        hashed_trip_id,
        argMin(arrival_time, stop_sequence) AS first_arrival_time,
        argMax(stop_name, stop_sequence)    AS last_stop_name
    FROM eta.curr_waypoints_snapped
    GROUP BY hashed_trip_id
)
SELECT
    if(empty(r._id), e.trip_id, concat('[', splitByChar('-', r._id)[1], ']', e.trip_id)) AS trip_id,
    e.vehicle_id                                                             AS vehicle_id,
    e.stop_id                                                                AS stop_id,
    e.stop_sequence                                                          AS stop_sequence,
    splitByChar('|', substringIndex(e.trip_id, ']', -1))[1]                      AS pattern_id,
    splitByChar('_', splitByChar('|', substringIndex(e.trip_id, ']', -1))[1])[1] AS line_id,
    arrayStringConcat(
        arraySlice(
            splitByChar('_', splitByChar('|', substringIndex(e.trip_id, ']', -1))[1]),
            1, 2
        ),
        '_'
    )                                                                        AS route_id,
    ts.last_stop_name                                                        AS headsign,
    w.arrival_time                                                           AS scheduled_arrival,
    if(
        length(w.arrival_time) = 0 OR length(ts.first_arrival_time) = 0,
        NULL,
        toNullable(
            toInt64(intDiv(r.start_time_scheduled, 1000))
            + (
                toInt64(splitByChar(':', w.arrival_time)[1]) * 3600
                + toInt64(splitByChar(':', w.arrival_time)[2]) * 60
                + toInt64(splitByChar(':', w.arrival_time)[3])
                - toInt64(splitByChar(':', ts.first_arrival_time)[1]) * 3600
                - toInt64(splitByChar(':', ts.first_arrival_time)[2]) * 60
                - toInt64(splitByChar(':', ts.first_arrival_time)[3])
            )
        )
    )                                                                        AS scheduled_arrival_unix,
    if(
        e.current_node_index >= e.stop_node_index,
        formatDateTime(fromUnixTimestamp64Milli(e.position_created_at), '%H:%i:%S', 'Europe/Lisbon'),
        NULL
    )                                                                        AS observed_arrival,
    if(
        e.current_node_index >= e.stop_node_index,
        toNullable(toInt64(intDiv(e.position_created_at, 1000))),
        NULL
    )                                                                        AS observed_arrival_unix,
    if(
        e.eta_at IS NULL,
        NULL,
        formatDateTime(assumeNotNull(e.eta_at), '%H:%i:%S', 'Europe/Lisbon')
    )                                                                        AS estimated_arrival,
    if(
        e.eta_at IS NULL,
        NULL,
        toNullable(toInt64(toUnixTimestamp(assumeNotNull(e.eta_at))))
    )                                                                        AS estimated_arrival_unix
FROM eta.pred_trip_stop_etas AS e
LEFT JOIN eta.curr_waypoints_snapped AS w
    ON w.hashed_trip_id = e.hashed_trip_id AND w.stop_sequence = e.stop_sequence
LEFT JOIN eta.curr_rides AS r
    ON r.trip_id = e.trip_id
LEFT JOIN trip_summary AS ts
    ON ts.hashed_trip_id = e.hashed_trip_id
WHERE e.trip_id = {trip_id:String}
ORDER BY e.stop_sequence
