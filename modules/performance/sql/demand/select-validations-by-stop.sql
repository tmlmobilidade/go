SELECT
    assumeNotNull(trip_id) AS trip_id,
    assumeNotNull(pattern_id) AS pattern_id,
    assumeNotNull(stop_id) AS stop_id,
    count() AS validations
FROM simplified_apex.validations
WHERE
    pattern_id IS NOT NULL
    AND trip_id IS NOT NULL
    AND stop_id IS NOT NULL
GROUP BY
    pattern_id,
    trip_id,
    stop_id;
