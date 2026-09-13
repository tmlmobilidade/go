export const operationRidesV1ExtractionQuery = `
WITH

	/*
	 * -----------------------------------------------------------------------
	 * Latest rides in the requested scheduled-start range
	 * -----------------------------------------------------------------------
	 */
	rides_latest AS
	(
		SELECT
			*
		FROM operation.rides
		WHERE
			start_time_scheduled >= $1
			AND start_time_scheduled <= $2
		ORDER BY
			updated_at DESC
		LIMIT 1 BY _id
	),

	/*
	 * -----------------------------------------------------------------------
	 * Latest analysis records
	 * -----------------------------------------------------------------------
	 *
	 * The operational_date restriction keeps analysis reads limited to dates
	 * that are actually present in the selected rides.
	 */

	analysis_at_least_one_vehicle_event_on_first_stop AS
	(
		SELECT
			ride_id,
			argMax(grade_status, updated_at) AS grade_status,
			argMax(reason, updated_at) AS reason,
			argMax(vehicle_events_on_first_stop_qty, updated_at)
				AS vehicle_events_on_first_stop_qty
		FROM operation.ride_analysis_at_least_one_vehicle_event_on_first_stop
		WHERE operational_date IN
		(
			SELECT DISTINCT operational_date
			FROM rides_latest
		)
		GROUP BY ride_id
	),

	analysis_expected_driver_id_qty AS
	(
		SELECT
			ride_id,
			argMax(grade_status, updated_at) AS grade_status,
			argMax(reason, updated_at) AS reason,
			argMax(observed_driver_ids_qty, updated_at)
				AS observed_driver_ids_qty
		FROM operation.ride_analysis_expected_driver_id_qty
		WHERE operational_date IN
		(
			SELECT DISTINCT operational_date
			FROM rides_latest
		)
		GROUP BY ride_id
	),

	analysis_expected_start_time AS
	(
		SELECT
			ride_id,
			argMax(grade_status, updated_at) AS grade_status,
			argMax(reason, updated_at) AS reason,
			argMax(observed_start_time, updated_at)
				AS observed_start_time
		FROM operation.ride_analysis_expected_start_time
		WHERE operational_date IN
		(
			SELECT DISTINCT operational_date
			FROM rides_latest
		)
		GROUP BY ride_id
	),

	analysis_expected_vehicle_event_delay AS
	(
		SELECT
			ride_id,
			argMax(grade_status, updated_at) AS grade_status,
			argMax(reason, updated_at) AS reason,
			argMax(vehicle_events_with_delay_qty, updated_at)
				AS vehicle_events_with_delay_qty
		FROM operation.ride_analysis_expected_vehicle_event_delay
		WHERE operational_date IN
		(
			SELECT DISTINCT operational_date
			FROM rides_latest
		)
		GROUP BY ride_id
	),

	analysis_expected_vehicle_event_interval AS
	(
		SELECT
			ride_id,
			argMax(grade_status, updated_at) AS grade_status,
			argMax(reason, updated_at) AS reason,
			argMax(observed_average_interval, updated_at)
				AS observed_average_interval
		FROM operation.ride_analysis_expected_vehicle_event_interval
		WHERE operational_date IN
		(
			SELECT DISTINCT operational_date
			FROM rides_latest
		)
		GROUP BY ride_id
	),

	analysis_expected_vehicle_event_qty AS
	(
		SELECT
			ride_id,
			argMax(grade_status, updated_at) AS grade_status,
			argMax(reason, updated_at) AS reason,
			argMax(observed_vehicle_events_qty, updated_at)
				AS observed_vehicle_events_qty
		FROM operation.ride_analysis_expected_vehicle_event_qty
		WHERE operational_date IN
		(
			SELECT DISTINCT operational_date
			FROM rides_latest
		)
		GROUP BY ride_id
	),

	analysis_expected_vehicle_id_qty AS
	(
		SELECT
			ride_id,
			argMax(grade_status, updated_at) AS grade_status,
			argMax(reason, updated_at) AS reason,
			argMax(observed_vehicle_ids_qty, updated_at)
				AS observed_vehicle_ids_qty
		FROM operation.ride_analysis_expected_vehicle_id_qty
		WHERE operational_date IN
		(
			SELECT DISTINCT operational_date
			FROM rides_latest
		)
		GROUP BY ride_id
	),

	analysis_matching_apex_locations AS
	(
		SELECT
			ride_id,
			argMax(grade_status, updated_at) AS grade_status,
			argMax(reason, updated_at) AS reason
		FROM operation.ride_analysis_matching_apex_locations
		WHERE operational_date IN
		(
			SELECT DISTINCT operational_date
			FROM rides_latest
		)
		GROUP BY ride_id
	),

	analysis_simple_one_apex_validation AS
	(
		SELECT
			ride_id,
			argMax(grade_status, updated_at) AS grade_status,
			argMax(reason, updated_at) AS reason
		FROM operation.ride_analysis_simple_one_apex_validation
		WHERE operational_date IN
		(
			SELECT DISTINCT operational_date
			FROM rides_latest
		)
		GROUP BY ride_id
	),

	analysis_simple_one_vehicle_event_or_apex_validation AS
	(
		SELECT
			ride_id,
			argMax(grade_status, updated_at) AS grade_status,
			argMax(reason, updated_at) AS reason
		FROM operation.ride_analysis_simple_one_vehicle_event_or_apex_validation
		WHERE operational_date IN
		(
			SELECT DISTINCT operational_date
			FROM rides_latest
		)
		GROUP BY ride_id
	),

	analysis_simple_three_vehicle_events AS
	(
		SELECT
			ride_id,
			argMax(grade_status, updated_at) AS grade_status,
			argMax(reason, updated_at) AS reason
		FROM operation.ride_analysis_simple_three_vehicle_events
		WHERE operational_date IN
		(
			SELECT DISTINCT operational_date
			FROM rides_latest
		)
		GROUP BY ride_id
	),

	analysis_transaction_sequentiality AS
	(
		SELECT
			ride_id,
			argMax(grade_status, updated_at) AS grade_status,
			argMax(reason, updated_at) AS reason
		FROM operation.ride_analysis_transaction_sequentiality
		WHERE operational_date IN
		(
			SELECT DISTINCT operational_date
			FROM rides_latest
		)
		GROUP BY ride_id
	)

SELECT
	/*
	 * -----------------------------------------------------------------------
	 * Ride
	 * -----------------------------------------------------------------------
	 */

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
	r.vehicle_ids,

	/*
	 * -----------------------------------------------------------------------
	 * Analyses
	 * -----------------------------------------------------------------------
	 */

	analysis_at_least_one_vehicle_event_on_first_stop.grade_status
		AS analysis_at_least_one_vehicle_event_on_first_stop_grade_status,

	analysis_at_least_one_vehicle_event_on_first_stop.reason
		AS analysis_at_least_one_vehicle_event_on_first_stop_reason,

	analysis_at_least_one_vehicle_event_on_first_stop.vehicle_events_on_first_stop_qty
		AS analysis_at_least_one_vehicle_event_on_first_stop_qty,


	analysis_expected_driver_id_qty.grade_status
		AS analysis_expected_driver_id_qty_grade_status,

	analysis_expected_driver_id_qty.reason
		AS analysis_expected_driver_id_qty_reason,

	analysis_expected_driver_id_qty.observed_driver_ids_qty
		AS analysis_expected_driver_id_qty_observed_driver_ids_qty,


	analysis_expected_start_time.grade_status
		AS analysis_expected_start_time_grade_status,

	analysis_expected_start_time.reason
		AS analysis_expected_start_time_reason,

	analysis_expected_start_time.observed_start_time
		AS analysis_expected_start_time_observed_start_time,


	analysis_expected_vehicle_event_delay.grade_status
		AS analysis_expected_vehicle_event_delay_grade_status,

	analysis_expected_vehicle_event_delay.reason
		AS analysis_expected_vehicle_event_delay_reason,

	analysis_expected_vehicle_event_delay.vehicle_events_with_delay_qty
		AS analysis_expected_vehicle_event_delay_vehicle_events_with_delay_qty,


	analysis_expected_vehicle_event_interval.grade_status
		AS analysis_expected_vehicle_event_interval_grade_status,

	analysis_expected_vehicle_event_interval.reason
		AS analysis_expected_vehicle_event_interval_reason,

	analysis_expected_vehicle_event_interval.observed_average_interval
		AS analysis_expected_vehicle_event_interval_observed_average_interval,


	analysis_expected_vehicle_event_qty.grade_status
		AS analysis_expected_vehicle_event_qty_grade_status,

	analysis_expected_vehicle_event_qty.reason
		AS analysis_expected_vehicle_event_qty_reason,

	analysis_expected_vehicle_event_qty.observed_vehicle_events_qty
		AS analysis_expected_vehicle_event_qty_observed_vehicle_events_qty,


	analysis_expected_vehicle_id_qty.grade_status
		AS analysis_expected_vehicle_id_qty_grade_status,

	analysis_expected_vehicle_id_qty.reason
		AS analysis_expected_vehicle_id_qty_reason,

	analysis_expected_vehicle_id_qty.observed_vehicle_ids_qty
		AS analysis_expected_vehicle_id_qty_observed_vehicle_ids_qty,


	analysis_matching_apex_locations.grade_status
		AS analysis_matching_apex_locations_grade_status,

	analysis_matching_apex_locations.reason
		AS analysis_matching_apex_locations_reason,


	analysis_simple_one_apex_validation.grade_status
		AS analysis_simple_one_apex_validation_grade_status,

	analysis_simple_one_apex_validation.reason
		AS analysis_simple_one_apex_validation_reason,


	analysis_simple_one_vehicle_event_or_apex_validation.grade_status
		AS analysis_simple_one_vehicle_event_or_apex_validation_grade_status,

	analysis_simple_one_vehicle_event_or_apex_validation.reason
		AS analysis_simple_one_vehicle_event_or_apex_validation_reason,


	analysis_simple_three_vehicle_events.grade_status
		AS analysis_simple_three_vehicle_events_grade_status,

	analysis_simple_three_vehicle_events.reason
		AS analysis_simple_three_vehicle_events_reason,


	analysis_transaction_sequentiality.grade_status
		AS analysis_transaction_sequentiality_grade_status,

	analysis_transaction_sequentiality.reason
		AS analysis_transaction_sequentiality_reason

FROM rides_latest AS r

LEFT JOIN analysis_at_least_one_vehicle_event_on_first_stop
	ON analysis_at_least_one_vehicle_event_on_first_stop.ride_id = r._id

LEFT JOIN analysis_expected_driver_id_qty
	ON analysis_expected_driver_id_qty.ride_id = r._id

LEFT JOIN analysis_expected_start_time
	ON analysis_expected_start_time.ride_id = r._id

LEFT JOIN analysis_expected_vehicle_event_delay
	ON analysis_expected_vehicle_event_delay.ride_id = r._id

LEFT JOIN analysis_expected_vehicle_event_interval
	ON analysis_expected_vehicle_event_interval.ride_id = r._id

LEFT JOIN analysis_expected_vehicle_event_qty
	ON analysis_expected_vehicle_event_qty.ride_id = r._id

LEFT JOIN analysis_expected_vehicle_id_qty
	ON analysis_expected_vehicle_id_qty.ride_id = r._id

LEFT JOIN analysis_matching_apex_locations
	ON analysis_matching_apex_locations.ride_id = r._id

LEFT JOIN analysis_simple_one_apex_validation
	ON analysis_simple_one_apex_validation.ride_id = r._id

LEFT JOIN analysis_simple_one_vehicle_event_or_apex_validation
	ON analysis_simple_one_vehicle_event_or_apex_validation.ride_id = r._id

LEFT JOIN analysis_simple_three_vehicle_events
	ON analysis_simple_three_vehicle_events.ride_id = r._id

LEFT JOIN analysis_transaction_sequentiality
	ON analysis_transaction_sequentiality.ride_id = r._id

WHERE
	1 = 1

	--DYNAMIC FILTERS HERE--

ORDER BY
	r.start_time_scheduled ASC,
	r._id ASC
`;
