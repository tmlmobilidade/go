-- Out-of-window partitions of eta.hist_node_travel_times.
--
-- The table is partitioned by the UTC day of `created_at` (YYYYMMDD), so
-- ageing data out is a partition drop, not a mutation. This file only lists the
-- partitions to drop; the app issues one
-- `ALTER TABLE eta.hist_node_travel_times DROP PARTITION <id>` per row.
-- A table TTL of 35 days is the safety net if the cleanup stage is disabled.
--
-- Parameters:
--   {min_partition:UInt32} = first YYYYMMDD (UTC) to keep

SELECT
    partition AS partition_id,
    sum(rows) AS rows
FROM system.parts
WHERE
    database = 'eta'
    AND table = 'hist_node_travel_times'
    AND active
    AND toUInt32(partition) < {min_partition:UInt32}
GROUP BY partition
ORDER BY partition;
