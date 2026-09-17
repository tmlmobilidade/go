/* * */

import { OperationPostersV1TripsSchema } from '@tmlmobilidade/go-types-operation';
import { Logger } from '@tmlmobilidade/logger';

import { type OperationPostersV1Context, type OperationPostersV1Tables } from '../types/context.js';
import { yieldToEventLoop } from '../utils/yield-to-event-loop.js';

/* * */

export async function exportTripsFile(context: OperationPostersV1Context, sqlTables: OperationPostersV1Tables, routeIds: ReadonlyMap<string, string>) {
	//
	// Export trips.txt

	let exportedRows = 0;

	for (const tripData of sqlTables.trips.all('ORDER BY trip_id ASC')) {
		const routeId = routeIds.get(tripData.route_id);
		if (!routeId) throw new Error(`Cannot export trip ${tripData.trip_id}: route ${tripData.route_id} was not exported.`);

		const data = OperationPostersV1TripsSchema.parse({
			direction_id: tripData.direction_id,
			route_id: routeId,
			service_id: tripData.service_id,
			shape_id: tripData.shape_id,
			trip_headsign: tripData.trip_headsign,
			trip_id: tripData.trip_id,
			wheelchair_accessible: tripData.wheelchair_accessible ?? '0',
		});
		await context.writers.trips.write(data);
		exportedRows++;
		await yieldToEventLoop(exportedRows);
	}

	await context.writers.trips.flush();

	Logger.info({ message: 'Exported trips.txt file.' });
}
