-- Delete out-of-window rides from eta.curr_rides.
-- 
-- "Out-of-window" rides are those where `start_time_scheduled` is:
--   - earlier than the lower window boundary: now (ms) - window_hours_before hours
--   - or later than the upper window boundary: now (ms) + window_hours_after hours
-- 
-- `start_time_scheduled` is Unix time in milliseconds (see UnixTimestampSchema).
-- Boundaries use toUnixTimestamp64Milli(now()) and hour offsets as ms (× 60 × 60 × 1000).
-- 
-- Parameters:
--   {window_hours_before:UInt32} = hours before now for window lower bound
--   {window_hours_after:UInt32}  = hours after now for window upper bound
--
-- Preview the number of current rides that will be deleted:

SELECT count() AS rows_to_delete FROM eta.curr_rides
WHERE
	start_time_scheduled < toUInt64(toUnixTimestamp64Milli(now())) - (toUInt64({window_hours_before:UInt32}) * 60 * 60 * 1000)
	OR start_time_scheduled > toUInt64(toUnixTimestamp64Milli(now())) + (toUInt64({window_hours_after:UInt32}) * 60 * 60 * 1000);

-- Delete all out-of-window rides from eta.curr_rides:

ALTER TABLE eta.curr_rides
DELETE WHERE
	start_time_scheduled < toUInt64(toUnixTimestamp64Milli(now())) - (toUInt64({window_hours_before:UInt32}) * 60 * 60 * 1000)
	OR start_time_scheduled > toUInt64(toUnixTimestamp64Milli(now())) + (toUInt64({window_hours_after:UInt32}) * 60 * 60 * 1000);
