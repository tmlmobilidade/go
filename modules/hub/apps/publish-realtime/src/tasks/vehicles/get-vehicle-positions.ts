/* * */

import { pipelinePath } from '@tmlmobilidade/go-hub-pckg-sql';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type HubVehiclePosition } from '@tmlmobilidade/go-types-hub';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/* * */

const SECONDS_AGO = 90;
const BEARING_INFERENCE_LOOKBACK_SECONDS = 300;

/* * */

/**
 * Retrieves the latest vehicle positions from the database.
 *
 * This function executes a SQL query to fetch the latest vehicle positions from the database.
 * It returns an array of `HubVehiclePosition` objects.
 *
 * @returns Array of `HubVehiclePosition` objects.
 */
export async function getVehiclePositions(): Promise<HubVehiclePosition[]> {
	return labDb.queryFromFile<HubVehiclePosition>(
		pipelinePath('select-vehicle-positions.sql'),
		{
			bearingInferenceLookbackSeconds: BEARING_INFERENCE_LOOKBACK_SECONDS,
			secondsAgo: SECONDS_AGO,
			stdWindowHours: Dates.standardWindowHours,
		},
	);
}
