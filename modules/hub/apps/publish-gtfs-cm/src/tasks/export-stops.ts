/* * */

import { encodeStopFlags } from '@tmlmobilidade/go-hub-pckg-utils';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type HubV1GtfsStopsInput, HubV1GtfsStopsSchema } from '@tmlmobilidade/go-types-hub';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

import { type ExportGtfsContext } from '../types/context.js';

/* * */

export async function exportStopsFile(context: ExportGtfsContext, agencyIds: string[]) {
	//

	const timer = new Timer();

	Logger.info({ message: 'Exporting stops.txt file...' });

	//
	// Get all the stops for the specified agency IDs

	const allStopsData = await goDb.infrastructure.stops.findMany(
		{
			'flags.agency_ids': { $in: agencyIds },
			'is_deleted': false,
		},
		{ sort: { _id: 1 } },
	);

	//
	// Export the stops

	for (const stopData of allStopsData) {
		//

		//
		// Encode the stop flags to accomodate
		// multiple stop IDs for each agency

		const encodedStopFlags = encodeStopFlags(stopData.flags, agencyIds);

		const { location } = stopData;

		const parsedStopsRow: HubV1GtfsStopsInput = {
			district_id: String(location.primary.osm_id),
			district_name: location.primary.name,
			flags: encodedStopFlags,
			legacy_ids: stopData.legacy_ids.join('|'),
			lifecycle_status: stopData.lifecycle_status,
			locality_id: location.neighbourhood ? String(location.neighbourhood.osm_id) : '-',
			locality_name: location.neighbourhood?.name ?? '-',
			location_type: '0',
			municipality_id: String(location.secondary.osm_id),
			municipality_name: location.secondary.name,
			parish_id: String(location.tertiary.osm_id),
			parish_name: location.tertiary.name,
			platform_code: '',
			stop_code: String(stopData._id),
			stop_id: String(stopData._id),
			stop_lat: stopData.latitude,
			stop_lon: stopData.longitude,
			stop_name: stopData.name,
			tts_stop_name: stopData.tts_name ?? '-',
			wheelchair_boarding: '0',
		};

		const validatedStopsRow = HubV1GtfsStopsSchema.parse(parsedStopsRow);

		await context.writers.stops.write(validatedStopsRow);
	}

	await context.writers.stops.flush();

	Logger.success(`Exported stops.txt file in ${timer.get()}.`);
}
