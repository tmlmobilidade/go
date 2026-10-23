SELECT partition,
       countIf(database = 'temp_performance') > 0 AS has_replacement
FROM system.parts
WHERE active
  AND ((database = 'temp_performance' AND table = {stage:String})
       OR (database = 'performance' AND table = 'demand_by_agency_by_operational_date'))
  AND toUInt32(partition) BETWEEN intDiv({start_date:UInt32}, 100) AND intDiv({end_date:UInt32}, 100)
  AND partition NOT IN {exclude_months:Array(String)}
GROUP BY partition
ORDER BY partition;
