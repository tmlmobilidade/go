/* eslint-disable perfectionist/sort-objects */
/* * */

import { type GtfsSteppV1ExportConfig } from '@/types.js';
import { type GtfsStrictV30SteppStops, GtfsStrictV30SteppStopsSchema } from '@tmlmobilidade/go-types-gtfs-strict';
import { type Stop } from '@tmlmobilidade/go-types-infrastructure';

import { getAgencyStopId } from '../utils/get-agency-stop-id.js';

/**
 * Parses stop data into GTFS stops.txt format
 * @param stopData - The stop data
 * @param agencyId - The agency id for which to extract stop_id
 * @returns The formatted stop row
 */
export function parseStop(
	stopData: Stop,
	agencyId: string,
): GtfsStrictV30SteppStops {
	try {
		return GtfsStrictV30SteppStopsSchema.parse({
			stop_id: getAgencyStopId(stopData, agencyId),
			stop_code: getAgencyStopId(stopData, agencyId),
			stop_name: stopData.name,
			stop_desc: stopData.location.secondary.name + ' - ' + stopData.location.tertiary.name,
			stop_lat: Number(stopData.latitude.toFixed(6)),
			stop_lon: Number(stopData.longitude.toFixed(6)),
			zone_id: '',
		});
	} catch (error) {
		throw new Error(`Error parsing stop ${stopData._id}: ${error}`, error);
	}
}

/**
 * Exports a single stop to stops.txt
 * @param stopData - The stop data
 * @param exportConfig - The export configuration
 */
export async function exportStop(
	stopData: Stop,
	exportConfig: GtfsSteppV1ExportConfig,
) {
	const agencyId = exportConfig.agency_id;
	const parsedStop = parseStop(stopData, agencyId);
	await exportConfig.writers.stops.write(parsedStop);
}
