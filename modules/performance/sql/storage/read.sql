SELECT metric, output_date, properties, path, numbers, strings, booleans, scalar, toFloat64(generated_at) AS generated_at
FROM temp_performance.rows_at(input_runs = {input_runs:Array(UUID)})
WHERE metric = {metric:String}
  AND (empty({line_ids:Array(String)}) OR properties['line_id'] IN {line_ids:Array(String)})
  AND (empty({pattern_ids:Array(String)}) OR properties['pattern_id'] IN {pattern_ids:Array(String)})
ORDER BY properties, output_date, path;
