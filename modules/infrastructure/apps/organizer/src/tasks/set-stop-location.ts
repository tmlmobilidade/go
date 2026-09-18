/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { locationsProvider } from '@tmlmobilidade/go-providers-locations';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

const BATCH_SIZE = 25;

/**
 * Sets the administrative location (district, municipality, parish and locality)
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

					const matchingLocation = await locationsProvider.findLocationByGeo(stopData.latitude, stopData.longitude);

					if (!matchingLocation.municipality?._id) {
						throw new Error(`No municipality found for coordinates [${stopData.latitude}, ${stopData.longitude}], skipping...`);
					}

					await goDb.infrastructure.stops.updateById(stopData._id, {
						district_id: matchingLocation.district?._id ?? undefined,
						locality_id: matchingLocation.locality?._id ?? undefined,
						municipality_id: matchingLocation.municipality._id,
						parish_id: matchingLocation.parish?._id ?? undefined,
					});

					Logger.info({ message: `[${stopData._id}] Location set for coordinates [${stopData.latitude}, ${stopData.longitude}]: district [${matchingLocation.district?._id}] ${matchingLocation.district?.name} | municipality [${matchingLocation.municipality._id}] ${matchingLocation.municipality.name} | parish [${matchingLocation.parish?._id}] ${matchingLocation.parish?.name} | locality [${matchingLocation.locality?._id}] ${matchingLocation.locality?.name}` });
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
