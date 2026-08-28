/* * */

import { type ImportGtfsContext } from '@/types/context.js';
import { parseCsvFile } from '@/utils/parse-csv.js';
import { HubGtfsExportStopsSchema } from '@tmlmobilidade/go-types-public-info';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type GTFS_Stop_Extended_Raw, validateGtfsStopExtended } from '@tmlmobilidade/types';

/* * */

interface RawStop extends GTFS_Stop_Extended_Raw {
	lifecycle_status?: string
}

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

		const parseEachRow = async (data: RawStop) => {
			// Validate the current row against the proper type
			const validatedGtfsData = validateGtfsStopExtended(data);
			const validatedData = HubGtfsExportStopsSchema.parse({
				district_id: validatedGtfsData.district_id ?? '',
				district_name: validatedGtfsData.district_name ?? '',
				flags: validatedGtfsData.flags ?? '',
				legacy_ids: validatedGtfsData.legacy_ids ?? '',
				lifecycle_status: data.lifecycle_status,
				locality_id: validatedGtfsData.locality_id,
				locality_name: validatedGtfsData.locality_name,
				location_type: String(validatedGtfsData.location_type),
				municipality_id: validatedGtfsData.municipality_id ?? '',
				municipality_name: validatedGtfsData.municipality_name ?? '',
				parent_station: validatedGtfsData.parent_station ?? '',
				parish_id: validatedGtfsData.parish_id ?? '',
				parish_name: validatedGtfsData.parish_name ?? '',
				platform_code: validatedGtfsData.platform_code ?? '',
				stop_code: Number(validatedGtfsData.stop_code),
				stop_id: Number(validatedGtfsData.stop_id),
				stop_lat: validatedGtfsData.stop_lat,
				stop_lon: validatedGtfsData.stop_lon,
				stop_name: validatedGtfsData.stop_name,
				stop_short_name: validatedGtfsData.stop_short_name ?? '',
				tts_stop_name: validatedGtfsData.tts_stop_name ?? '',
				wheelchair_boarding: String(validatedGtfsData.wheelchair_boarding),
			});
			// Skip if stop already exists
			if (context.gtfs.stops.get('stop_id', validatedData.stop_id)) return;
			// Save the exported row
			context.gtfs.stops.write(validatedData);
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
