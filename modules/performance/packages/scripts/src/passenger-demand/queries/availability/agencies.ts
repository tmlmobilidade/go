/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';

/* * */

interface AvailableAgencyRow {
	agency_id: string
}

/* * */

export const AVAILABLE_PASSENGER_DEMAND_AGENCIES_QUERY = `
	SELECT agency_id
	FROM (
		SELECT agency_id
		FROM performance.passenger_demand_by_dimensions_by_day
		WHERE agency_id != ''
		GROUP BY agency_id

		UNION ALL

		SELECT agency_id
		FROM performance.passenger_demand_by_dimensions_by_5_minutes
		WHERE agency_id != ''
		GROUP BY agency_id
	)
	GROUP BY agency_id
	ORDER BY agency_id
`;

/**
 * Retrieve every agency identifier represented in the available passenger-demand facts.
 */
export async function queryAvailablePassengerDemandAgencyIds(): Promise<string[]> {
	const rows = await labDb.performance.passengerDemandByDimensionsByDay.queryFromString<AvailableAgencyRow>(
		AVAILABLE_PASSENGER_DEMAND_AGENCIES_QUERY,
	);

	return rows.map(row => row.agency_id);
}
