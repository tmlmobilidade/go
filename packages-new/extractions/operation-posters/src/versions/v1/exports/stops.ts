/* * */

import { StopsSchema } from '@tmlmobilidade/go-types-gtfs-hitouch';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { type OperationPostersV1Context, type OperationPostersV1Tables } from '../types/context.js';
import { yieldToEventLoop } from '../utils/yield-to-event-loop.js';

/* * */

export async function exportStopsFile(context: OperationPostersV1Context, sqlTables: OperationPostersV1Tables) {
	//

	//
	// A. Validate and write stops referenced by stop times

	let exportedRows = 0;

	for (const stopData of sqlTables.stops.all('WHERE stop_id IN (SELECT DISTINCT stop_id FROM stop_times)')) {
		const data = StopsSchema.parse({
			location_type: stopData.location_type ?? '0',
			parent_station: stopData.parent_station ?? '',
			platform_code: stopData.platform_code ?? '',
			stop_code: stopData.stop_code,
			stop_id: stopData.stop_id,
			stop_lat: stopData.stop_lat,
			stop_lon: stopData.stop_lon,
			stop_name: stopData.stop_name,
			wheelchair_boarding: stopData.wheelchair_boarding ?? undefined,
		});

		await context.writers.stops.write(data);
		exportedRows++;
		await yieldToEventLoop(exportedRows);
	}

	await context.writers.stops.flush();

	Logger.info({ message: 'Exported stops.txt file.' });
}
