-- DEMAND BY AGENCY BY OPERATIONAL DATE

INSERT INTO performance.demand_by_agency_by_operational_date
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
WHERE is_passenger = 1 AND operational_date >= {start_date:UInt32}
GROUP BY
	agency_id,
	operational_date;