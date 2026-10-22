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
	sum(passenger_qty) AS qty,
	now64(3) AS updated_at
FROM (
    SELECT agency_id, operational_date, toInt64(1) AS passenger_qty
    FROM simplified_apex.validations WHERE is_passenger = 1
    UNION ALL
    SELECT agency_id, operational_date, toInt64(ifNull(group_dimension, 1)) AS passenger_qty
    FROM simplified_apex.banking_taps
)
WHERE operational_date >= {start_date:UInt32}
  AND operational_date <= {end_date:UInt32}
  AND toString(intDiv(operational_date, 100)) NOT IN {exclude_months:Array(String)}
GROUP BY
	agency_id,
	operational_date;
