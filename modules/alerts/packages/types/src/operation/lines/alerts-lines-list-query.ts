/* * */

export const alertsLinesListQuery = `
WITH

	/*
	 * Capture the current time once so all derived statuses use exactly
	 * the same timestamp.
	 */
	toUnixTimestamp64Milli(now64(3)) AS now_ms,

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
			END AS start_delay_status

		FROM rides_latest
	),

	/*
	 * -----------------------------------------------------------------------
	 * Apply alert filters
	 * -----------------------------------------------------------------------
	 *
	 * Filters are applied to individual rides before route aggregation.
	 *
	 * DYNAMIC FILTERS HERE is expected to be replaced by the query builder.
	 */
	filtered_rides AS
	(
		SELECT
			*
		FROM ride_with_statuses

		WHERE
			1 = 1

			--DYNAMIC FILTERS HERE--
	),

	/*
	 * -----------------------------------------------------------------------
	 * Route summary
	 * -----------------------------------------------------------------------
	 *
	 * Group all matching rides by route_short_name.
	 *
	 * route_ids:
	 *   Contains every route_id that has at least one matching Ride.
	 *
	 * route_long_name:
	 *   Uses the route_long_name belonging to the smallest route_id.
	 *   This gives us the "base route".
	 */
	route_summary AS
	(
		SELECT
			route_short_name,

			arraySort(
				groupUniqArray(route_id)
			) AS route_ids,

			argMin(
				route_long_name,
				route_id
			) AS route_long_name

		FROM filtered_rides

		GROUP BY
			route_short_name
	)

SELECT
	route_ids,
	route_short_name,
	route_long_name

FROM route_summary

ORDER BY
	route_short_name ASC;
`;
