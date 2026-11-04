SELECT formatDateTime(date, '%Y%m%d') AS date, day_type, holiday, period, notes
FROM temp_performance.calendar
WHERE run_id IN {input_runs:Array(UUID)}
ORDER BY date;
