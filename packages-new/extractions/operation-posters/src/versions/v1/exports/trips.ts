/* * */

import { TripsSchema } from '@tmlmobilidade/go-types-gtfs-hitouch';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { type OperationPostersV1Context, type OperationPostersV1Tables } from '../types/context.js';
import { yieldToEventLoop } from '../utils/yield-to-event-loop.js';

/* * */

export async function exportTripsFile(context: OperationPostersV1Context, sqlTables: OperationPostersV1Tables, routeIds: ReadonlyMap<string, string>) {
	//

	//
	// A. Export trips.txt

	let exportedRows = 0;

	//
	// B. Export the trips

	for (const tripData of sqlTables.trips.all(`ORDER BY trip_id ASC`, [])) {
		//
		// 1. Get the route ID

		const routeId = routeIds.get(tripData.route_id);
		if (!routeId) throw new Error(`Cannot export trip ${tripData.trip_id}: route ${tripData.route_id} was not exported.`);

		//
		// 2. Validate and write the trip

		const data = TripsSchema.parse({
			direction_id: '0',
			route_id: routeId,
			service_id: tripData.service_id,
			shape_id: tripData.shape_id,
			trip_headsign: tripData.trip_headsign ?? undefined,
			trip_id: tripData.trip_id,
			wheelchair_accessible: tripData.wheelchair_accessible ?? '0',
		});
		await context.writers.trips.write(data);
		await yieldToEventLoop(++exportedRows);
	}

	//
	// C. Flush the trips file

	await context.writers.trips.flush();

	Logger.info({ message: 'Exported trips.txt file.' });
}
