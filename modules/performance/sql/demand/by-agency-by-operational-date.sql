-- DEMAND BY AGENCY BY OPERATIONAL DATE

INSERT INTO temp_performance.{stage:Identifier}
(
	agency_id,
	operational_date,
	qty,
	updated_at
)
SELECT
	agency_id,
	operational_date,
	count() AS qty,
	now64(3) AS updated_at
FROM simplified_apex.validations
WHERE is_passenger = 1
  AND operational_date >= {start_date:UInt32}
  AND operational_date <= {end_date:UInt32}
  AND toString(intDiv(operational_date, 100)) NOT IN {exclude_months:Array(String)}
GROUP BY
	agency_id,
	operational_date;
