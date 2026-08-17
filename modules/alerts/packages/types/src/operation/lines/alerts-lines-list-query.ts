/* * */

/* * */

export const alertsLinesListQuery = `
WITH

	/*
	 * -----------------------------------------------------------------------
	 * Latest Ride version
	 * -----------------------------------------------------------------------
	 *
	 * Rides use ReplacingMergeTree(updated_at).
	 *
	 * Select the latest physical version explicitly instead of using FINAL.
	 *
	 * The agency and scheduled start-time filters are applied before
	 * LIMIT BY so ClickHouse can discard irrelevant data as early as possible.
	 */
	rides_latest AS
	(
		SELECT
			*
		FROM operation.rides
		WHERE
			agency_id = $1
			AND start_time_scheduled >= $2
			AND start_time_scheduled <= $3
		ORDER BY
			updated_at DESC
		LIMIT 1 BY _id
	),

	/*
	 * -----------------------------------------------------------------------
	 * Route summary
	 * -----------------------------------------------------------------------
	 *
	 * Group all rides operating in the requested time range by
	 * route_short_name.
	 *
	 * route_ids:
	 *   All distinct route IDs for the short name that have at least one
	 *   ride in the requested time range.
	 *
	 * route_long_name:
	 *   The long name belonging to the lowest route_id, which represents
	 *   the base route.
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

		FROM rides_latest

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
