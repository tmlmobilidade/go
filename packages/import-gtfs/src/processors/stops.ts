/* * */

import { type ImportGtfsContext } from '@/types/context.js';
import { parseCsvFile } from '@/utils/parse-csv.js';
import { type HubGtfsExportStops } from '@tmlmobilidade/go-types-public-info';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type GTFS_Stop_Extended_Raw, validateGtfsStopExtended } from '@tmlmobilidade/types';

/**
 * Processes the stops.txt file from the GTFS dataset.
 * include all of them since we don't have a way to filter them yet like trips/routes/shapes.
 * By saving all of them, we also speed up the processing of each stop_time by including the stop data right away.
 * @param context The import GTFS context containing references to SQL tables and other metadata.
 */
export async function processStopsFile(context: ImportGtfsContext): Promise<void> {
	try {
		//

		const stopsParseTimer = new Timer();

		Logger.info({ message: 'Reading zip entry "stops.txt"...' });

		const parseEachRow = async (data: GTFS_Stop_Extended_Raw) => {
			// Validate the current row against the proper type
			const validatedData = validateGtfsStopExtended(data);
			// Skip if stop already exists
			if (context.gtfs.stops.get('stop_id', Number(validatedData.stop_id))) return;
			// Save the exported row
			context.gtfs.stops.write({
				district_id: validatedData.district_id ?? '',
				district_name: validatedData.district_name ?? '',
				flags: validatedData.flags ?? '',
				legacy_ids: validatedData.legacy_ids ?? '',
				lifecycle_status: 'draft',
				locality_id: validatedData.locality_id ?? '',
				locality_name: validatedData.locality_name ?? '',
				location_type: String(validatedData.location_type ?? 0) as HubGtfsExportStops['location_type'],
				municipality_id: validatedData.municipality_id ?? '',
				municipality_name: validatedData.municipality_name ?? '',
				parent_station: validatedData.parent_station ?? '',
				parish_id: validatedData.parish_id ?? '',
				parish_name: validatedData.parish_name ?? '',
				platform_code: validatedData.platform_code ?? '',
				stop_code: Number(validatedData.stop_code),
				stop_id: Number(validatedData.stop_id),
				stop_lat: validatedData.stop_lat,
				stop_lon: validatedData.stop_lon,
				stop_name: validatedData.stop_name,
				stop_short_name: validatedData.stop_short_name ?? '',
				tts_stop_name: validatedData.tts_stop_name ?? '',
				wheelchair_boarding: String(validatedData.wheelchair_boarding ?? 0) as HubGtfsExportStops['wheelchair_boarding'],
			});
		};

		//
		// Setup the CSV parsing operation

		await parseCsvFile(`${context.workdir.extract_dir_path}/stops.txt`, parseEachRow);

		context.gtfs.stops.flush();

		Logger.success(`Finished processing "stops.txt": ${context.gtfs.stops.size} rows saved in ${stopsParseTimer.get()}.`, 1);

		//
	} catch (error) {
		Logger.error({ error, message: `Error processing "stops.txt" file: ${error.message}` });
		throw new Error('✖︎ Error processing "stops.txt" file.', error);
	}
}
