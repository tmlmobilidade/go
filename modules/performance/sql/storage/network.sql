SELECT DISTINCT properties[{dimension:String}] AS id
FROM temp_performance.rows_at(input_runs = {input_runs:Array(UUID)})
WHERE mapContains(properties, {dimension:String})
ORDER BY id;
