/* * */

export const aletsRidesListQuery = `
WITH

	/*
	 * Capture the current time once so all derived statuses use exactly
	 * the same timestamp.
	 */
	toUnixTimestamp64Milli(now64(3)) AS now_ms,

	/*
	 * -----------------------------------------------------------------------
	 * Exact Ride version
	 * -----------------------------------------------------------------------
	 *
	 * Select the exact ride version explicitly by its ID using
	 * text search parameter $3.
	 */
	exact_ride AS
	(
		SELECT
			*
		FROM operation.rides
		WHERE
			_id = $3
		ORDER BY
			updated_at DESC
		LIMIT 1 BY _id
	),

	/*
	 * -----------------------------------------------------------------------
	 * Latest Ride version
	 * -----------------------------------------------------------------------
	 *
	 * Rides use ReplacingMergeTree(updated_at).
	 *
	 * Select the latest physical version explicitly instead of using FINAL.
	 *
	 * The scheduled start time range is applied before LIMIT BY so that
	 * ClickHouse can discard irrelevant data as early as possible.
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
	 * Rides available to this query
	 * -----------------------------------------------------------------------
	 *
	 * The exact Ride is added to the normal date-filtered set.
	 *
	 * DISTINCT prevents the exact Ride from appearing twice when it already
	 * belongs to the requested date range.
	 */
	rides_for_query AS
	(
		SELECT *
		FROM rides_latest
		UNION DISTINCT
		SELECT *
		FROM exact_ride
	),

	/*
	 * -----------------------------------------------------------------------
	 * Calculate derived statuses.
	 * -----------------------------------------------------------------------
	 */
	ride_with_statuses AS
	(
		SELECT
			*,

			/*
			 * Operational status
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

		FROM rides_for_query
	),

SELECT
	_id,
	agency_id,
	headsign,
	operational_date,
	seen_last_at,
	shape_id,
	start_time_observed,
	start_time_scheduled,

	operational_status,
	seen_status,
	start_delay_status,

FROM ride_with_statuses

WHERE
	1 = 1
	--DYNAMIC FILTERS HERE--

ORDER BY
	start_time_scheduled ASC,
	_id ASC

LIMIT 10000;
`;
