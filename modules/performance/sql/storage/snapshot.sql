SELECT DISTINCT toString(argMax(run_id, tuple(reference_at, toString(run_id)))) AS run_id
FROM
(
    SELECT metric, run_id, reference_at,
           addDays(range_start, arrayJoin(range(toUInt32(dateDiff('day', range_start, range_end) + 1)))) AS output_date
    FROM temp_performance.refreshes
    WHERE metric IN {metrics:Array(String)}
)
GROUP BY metric, output_date;
