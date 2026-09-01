/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { locationsProvider } from '@tmlmobilidade/go-providers-locations';
import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export async function setStopLocationTask() {
	//

	//
	// Initialize the logger

	Logger.init();

	const globalTimer = new Timer();

	//
	// Get all Stop documents from the database

	const stopsCollection = await goDb.infrastructure.stops.getCollection();

	const allStopsStream = stopsCollection.find({}, {
		projection: { _id: 1, latitude: 1, longitude: 1 },
		sort: { _id: 1 },
	}).stream();

	//
	// Process each stop

	for await (const stopData of allStopsStream) {
		//

		console.log(`[${stopData._id}] Processing location for [${stopData.latitude}, ${stopData.longitude}]...`);

		const matchingLocation = await locationsProvider.findLocationByGeo(stopData.latitude, stopData.longitude);

		if (!matchingLocation.municipality?._id) {
			console.log(`[${stopData._id}] No municipality found for Stop ${stopData._id} [${stopData.latitude}, ${stopData.longitude}], skipping...`);
			continue;
		}

		await goDb.infrastructure.stops.updateById(stopData._id, {
			district_id: matchingLocation.district?._id || null,
			locality_id: matchingLocation.locality?._id || null,
			municipality_id: matchingLocation.municipality._id,
			parish_id: matchingLocation.parish?._id || null,
		});

		console.log(`[${stopData._id}] Location set — found municipality [${matchingLocation.municipality._id}] ${matchingLocation.municipality.name}, district [${matchingLocation.district?._id}] ${matchingLocation.district?.name}, parish [${matchingLocation.parish?._id}] ${matchingLocation.parish?.name}, locality [${matchingLocation.locality?._id}] ${matchingLocation.locality?.name}`);
	}

	Logger.terminate(`Stop location set in ${globalTimer.get()}`);

	//
}

await runOnInterval(setStopLocationTask, { intervalMs: '5m' });
