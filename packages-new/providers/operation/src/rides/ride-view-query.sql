/* * */

WITH

	/*
	 * The current time is captured once so every derived status in this
	 * query uses exactly the same timestamp.
	 */
	toUnixTimestamp64Milli(now64(3)) AS now_ms

	/*
	 * -----------------------------------------------------------------------
	 * Latest Ride version
	 * -----------------------------------------------------------------------
	 *
	 * ReplacingMergeTree may contain multiple physical versions of the same
	 * Ride before background merges occur.
	 *
	 * We therefore explicitly select the row with the greatest updated_at
	 * for each _id instead of using FINAL.
	 *
	 * The time range should be applied before LIMIT BY so ClickHouse can
	 * discard irrelevant partitions/data as early as possible.
	 */
	rides_latest AS
	(
		SELECT
			*
		FROM operation.rides
		WHERE
			start_time_scheduled >= 1641027600000 -- $1
			AND start_time_scheduled <= 1786467600000 -- $2
		ORDER BY
			updated_at DESC
		LIMIT 1 BY _id
	),

	/*
	 * -----------------------------------------------------------------------
	 * Latest analysis versions
	 * -----------------------------------------------------------------------
	 *
	 * Each analysis table is a ReplacingMergeTree with updated_at as its
	 * version. argMax() gives us the latest grade without FINAL.
	 *
	 * Only the grade is required for RideView.
	 */

	analysis_at_least_one_vehicle_event_on_last_stop AS
	(
		SELECT
			ride_id,
			argMax(grade_status, updated_at) AS grade_status
		FROM operation.ride_analysis_at_least_one_vehicle_event_on_last_stop
		WHERE operational_date IN
		(
			SELECT DISTINCT operational_date
			FROM rides_latest
		)
		GROUP BY ride_id
	),

	analysis_expected_apex_validation_interval AS
	(
		SELECT
			ride_id,
			argMax(grade_status, updated_at) AS grade_status
		FROM operation.ride_analysis_expected_apex_validation_interval
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
			argMax(grade_status, updated_at) AS grade_status
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
			argMax(grade_status, updated_at) AS grade_status
		FROM operation.ride_analysis_transaction_sequentiality
		WHERE operational_date IN
		(
			SELECT DISTINCT operational_date
			FROM rides_latest
		)
		GROUP BY ride_id
	),

	/*
	 * -----------------------------------------------------------------------
	 * Combine Ride data with the latest analysis results.
	 * -----------------------------------------------------------------------
	 *
	 * Missing analysis rows intentionally remain NULL.
	 */

	ride_with_analyses AS
	(
		SELECT
			r.*,

			analysis_at_least_one_vehicle_event_on_last_stop.grade_status
				AS analysis_at_least_one_vehicle_event_on_last_stop_grade,

			analysis_expected_apex_validation_interval.grade_status
				AS analysis_expected_apex_validation_interval_grade,

			analysis_simple_three_vehicle_events.grade_status
				AS analysis_simple_three_vehicle_events_grade,

			analysis_transaction_sequentiality.grade_status
				AS analysis_transaction_sequentiality_grade

		FROM rides_latest AS r

		LEFT JOIN analysis_at_least_one_vehicle_event_on_last_stop
			ON analysis_at_least_one_vehicle_event_on_last_stop.ride_id = r._id

		LEFT JOIN analysis_expected_apex_validation_interval
			ON analysis_expected_apex_validation_interval.ride_id = r._id

		LEFT JOIN analysis_simple_three_vehicle_events
			ON analysis_simple_three_vehicle_events.ride_id = r._id

		LEFT JOIN analysis_transaction_sequentiality
			ON analysis_transaction_sequentiality.ride_id = r._id
	),

	/*
	 * -----------------------------------------------------------------------
	 * Derived statuses.
	 * -----------------------------------------------------------------------
	 */

	ride_with_statuses AS
	(
		SELECT
			*,

			/*
			 * Operational status
			 *
			 * scheduled:
			 *   start is <= 10 minutes ago or in the future
			 *   and no vehicle event exists.
			 *
			 * missed:
			 *   start is > 10 minutes ago
			 *   and no vehicle event exists.
			 *
			 * running:
			 *   latest vehicle event is <= 10 minutes old.
			 *
			 * ended:
			 *   latest vehicle event is > 10 minutes old.
			 */
			CASE
				WHEN
					seen_last_at IS NULL
					AND now_ms - start_time_scheduled <= 600000
				THEN 'scheduled'

				WHEN
					seen_last_at IS NULL
					AND now_ms - start_time_scheduled > 600000
				THEN 'missed'

				WHEN
					seen_last_at IS NOT NULL
					AND now_ms - seen_last_at <= 600000
				THEN 'running'

				ELSE 'ended'
			END AS operational_status,

			/*
			 * Seen status
			 */
			CASE
				WHEN seen_last_at IS NULL
				THEN 'unseen'

				WHEN now_ms - seen_last_at <= 30000
				THEN 'seen'

				ELSE 'gone'
			END AS seen_status,

			/*
			 * Start delay status
			 */
			CASE
				WHEN start_time_observed IS NULL
				THEN NULL

				WHEN start_time_observed - start_time_scheduled > 300000
				THEN 'delayed'

				WHEN start_time_observed - start_time_scheduled < -60000
				THEN 'early'

				ELSE 'ontime'
			END AS start_delay_status,

			/*
			 * End delay status
			 */
			CASE
				WHEN end_time_observed IS NULL
				THEN NULL

				WHEN end_time_observed - end_time_scheduled > 300000
				THEN 'delayed'

				WHEN end_time_observed - end_time_scheduled < -60000
				THEN 'early'

				ELSE 'ontime'
			END AS end_delay_status

		FROM ride_with_analyses
	)

SELECT
	*,

	/*
	 * Analysis grades are not applicable while a ride is scheduled or
	 * running. In those cases the result is NULL.
	 *
	 * For completed/missed rides, the latest analysis result is returned.
	 * If no analysis exists yet, it remains NULL.
	 */

	CASE
		WHEN operational_status IN ('scheduled', 'running')
		THEN NULL
		ELSE analysis_at_least_one_vehicle_event_on_last_stop_grade
	END AS analysis_at_least_one_vehicle_event_on_last_stop_grade,

	CASE
		WHEN operational_status IN ('scheduled', 'running')
		THEN NULL
		ELSE analysis_expected_apex_validation_interval_grade
	END AS analysis_expected_apex_validation_interval_grade,

	CASE
		WHEN operational_status IN ('scheduled', 'running')
		THEN NULL
		ELSE analysis_simple_three_vehicle_events_grade
	END AS analysis_simple_three_vehicle_events_grade,

	CASE
		WHEN operational_status IN ('scheduled', 'running')
		THEN NULL
		ELSE analysis_transaction_sequentiality_grade
	END AS analysis_transaction_sequentiality_grade

FROM ride_with_statuses