-- Out-of-window partitions of eta.hist_node_travel_times.
--
-- The table is partitioned by the UTC day of `created_at` (YYYYMMDD), so
-- ageing data out is a partition drop, not a mutation. This file only lists the
-- partitions to drop; the cleaner task issues one
-- `ALTER TABLE eta.hist_node_travel_times DROP PARTITION <id>` per row.
-- A table TTL of 35 days is the safety net if the cleaner is not running.
--
-- Parameters:
--   {historical_data_days_back:UInt32} = days kept relative to today (UTC)

SELECT
    partition AS partition_id,
    sum(rows) AS rows
FROM system.parts
WHERE
    database = 'eta'
    AND table = 'hist_node_travel_times'
    AND active
    AND toUInt32(partition) < toYYYYMMDD(subtractDays(today(), {historical_data_days_back:UInt32}))
GROUP BY partition
ORDER BY partition;
