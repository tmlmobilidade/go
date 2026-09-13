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
)

SELECT
	r._id,
	r.agency_id,
	r.driver_ids,
	r.end_time_observed,
	r.end_time_scheduled,
	r.extension_observed,
	r.extension_scheduled,
	r.headsign,
	r.operational_date,
	r.passengers_estimated,
	r.plan_id,
	r.route_id,
	r.route_short_name,
	r.seen_first_at,
	r.seen_last_at,
	r.shape_id,
	r.start_time_observed,
	r.start_time_scheduled,
	r.processing_status,
	r.trip_id,
	r.apex_validations_qty,
	r.vehicle_ids

FROM rides_latest AS r

ORDER BY
	r.start_time_scheduled ASC,
	r._id ASC
`;
