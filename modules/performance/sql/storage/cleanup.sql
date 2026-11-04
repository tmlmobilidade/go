ALTER TABLE temp_performance.metric_rows DELETE
WHERE created_at < fromUnixTimestamp64Milli({cutoff:Int64})
  AND run_id NOT IN (SELECT run_id FROM temp_performance.retained_runs(cutoff = {cutoff:Int64}))
SETTINGS mutations_sync = 1;

ALTER TABLE temp_performance.agencies DELETE
WHERE created_at < fromUnixTimestamp64Milli({cutoff:Int64})
  AND run_id NOT IN (SELECT run_id FROM temp_performance.retained_runs(cutoff = {cutoff:Int64}))
SETTINGS mutations_sync = 1;

ALTER TABLE temp_performance.calendar DELETE
WHERE created_at < fromUnixTimestamp64Milli({cutoff:Int64})
  AND run_id NOT IN (SELECT run_id FROM temp_performance.retained_runs(cutoff = {cutoff:Int64}))
SETTINGS mutations_sync = 1;

ALTER TABLE temp_performance.refreshes DELETE
WHERE published_at < fromUnixTimestamp64Milli({cutoff:Int64})
  AND run_id NOT IN (SELECT run_id FROM temp_performance.retained_runs(cutoff = {cutoff:Int64}))
SETTINGS mutations_sync = 1;
