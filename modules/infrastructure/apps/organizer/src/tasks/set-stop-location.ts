/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { locationsProvider } from '@tmlmobilidade/go-providers-locations';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

/* * */

// Each stop is one heavy PostGIS lookup; keep the batch below the locations database pool size (20).
const BATCH_SIZE = 10;

/**
 * Sets the administrative location (country, primary, secondary, tertiary and neighbourhood)
 * of every stop in the database, based on its coordinates.
 */
export async function setStopLocationTask() {
	//

	const globalTimer = new Timer();

	//
	// Get Stop documents from the database in batches, sorted by _id

	let lastId: null | string = null;

	while (true) {
		//

		//
		// Get a batch of stops where _id is greater than the lastId,
		// or all stops if lastId is null, sorted by _id in ascending order

		const findQuery = lastId ? { _id: { $gt: lastId } } : {};

		const stops = await goDb.infrastructure.stops.findMany(findQuery, {
			limit: BATCH_SIZE,
			projection: { _id: 1, latitude: 1, longitude: 1 },
			sort: { _id: 1 },
		});

		if (stops.length === 0) break;

		//
		// Update the location for all stops in the batch
		// in parallel using the locationsProvider

		await Promise.all(
			stops.map(async (stopData) => {
				try {
					//

					const location = await locationsProvider.findLocationByGeo(stopData.latitude, stopData.longitude);

					await goDb.infrastructure.stops.updateById(stopData._id, { location });

					const summary = Object.entries(location).map(([slot, item]) => `${slot} [${item.osm_id}] ${item.name}`).join(' | ');
					Logger.info({ message: `[${stopData._id}] Location set for coordinates [${stopData.latitude}, ${stopData.longitude}]: ${summary}` });
				} catch (error) {
					Logger.error({ error, message: `[${stopData._id}] Error setting location` });
				}
			}),
		);

		//
		// Update the lastId to the _id of the last stop in the batch

		lastId = stops[stops.length - 1]._id;
	}

	Logger.info({ message: `Stop locations set in ${globalTimer.get()}` });
}
