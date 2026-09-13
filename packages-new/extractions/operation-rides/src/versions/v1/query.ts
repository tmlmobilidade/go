export const operationRidesV1ExtractionQuery = `
WITH rides_latest AS
(
	SELECT
		*
	FROM operation.rides
	WHERE
		start_time_scheduled >= {start_time_scheduled_start:Int64}
		AND start_time_scheduled <= {start_time_scheduled_end:Int64}
		AND has({agency_ids:Array(String)}, agency_id)
	ORDER BY
		updated_at DESC
	LIMIT 1 BY _id
),

analysis_simple_three_vehicle_events AS
(
	SELECT
		* AS data
	FROM operation.ride_analysis_simple_three_vehicle_events
	WHERE operational_date IN (
		SELECT DISTINCT operational_date
		FROM rides_latest
	)
	LIMIT 1 BY ride_id
),

SELECT
	r.*,

	analysis_simple_three_vehicle_events.data
		AS analysis_simple_three_vehicle_events

FROM rides_latest AS r

LEFT JOIN analysis_simple_three_vehicle_events
	ON analysis_simple_three_vehicle_events.ride_id = r._id

ORDER BY
	r.start_time_scheduled ASC,
	r._id ASC
`;
