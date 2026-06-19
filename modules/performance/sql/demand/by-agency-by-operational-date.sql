-- DEMAND BY AGENCY BY OPERATIONAL DATE

INSERT INTO performance.demand_by_agency_by_operational_date
(
	agency_id,
	operational_date,
	qty,
	updated_at
)
SELECT
	toString(agency_id) AS agency_id,
	toYYYYMMDD(
		toTimeZone(created_at, 'Europe/Lisbon') - INTERVAL 4 HOUR
	) AS operational_date,
	count() AS qty,
	now64(3) AS updated_at
FROM simplified_apex.validations
WHERE is_passenger = 1
GROUP BY
	agency_id,
	operational_date;