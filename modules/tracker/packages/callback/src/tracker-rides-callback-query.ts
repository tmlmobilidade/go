/* * */

export const trackerRidesCallbackQuery = `
SELECT
	r.*
FROM rides AS r
INNER JOIN
(
	SELECT
		tupleElement(w, 1) AS agency_id,
		tupleElement(w, 2) AS trip_id,
		tupleElement(w, 3) AS window_start,
		tupleElement(w, 4) AS window_end
	FROM
	(
		SELECT arrayJoin(
			arrayZip(
				{agency_ids:Array(String)},
				{trip_ids:Array(String)},
				{window_starts:Array(Int64)},
				{window_ends:Array(Int64)}
			)
		) AS w
	)
) AS windows
	ON r.agency_id = windows.agency_id
	AND r.trip_id = windows.trip_id
	AND r.start_time_scheduled >= windows.window_start
	AND r.start_time_scheduled <= windows.window_end
ORDER BY
	r.updated_at DESC
LIMIT 1 BY
	r._id
`;
