/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Stop } from '@tmlmobilidade/go-types-infrastructure';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

/**
 * Ensures the legacy IDs are set for all stops.
 */
export async function ensureLegacyIdsTask() {
	//

	const timer = new Timer();

	//
	// Loop over all stops and ensure the legacy IDs are set

	Logger.info('Ensuring legacy IDs are set for all stops');

	const stopsCollection = await goDb.infrastructure.stops.getCollection();

	const stopsStream = stopsCollection.find({}, { sort: { _id: 1 } }).stream();

	for await (const stopItem of stopsStream) {
		//

		const stopTimer = new Timer();

		const stopData = stopItem as Stop;

		//
		// Create a new Set of existing legacy IDs

		const existingLegacyIds = new Set(stopData.legacy_ids || []);

		//
		// Add all the flag IDs to the legacy IDs array,
		// avoiding duplicates. Legacy IDs are add-only.

		const flagIds = stopData.flags?.map(flag => flag.stop_id) || [];

		flagIds.forEach(flagId => existingLegacyIds.add(flagId));

		const newLegacyIds = Array.from(existingLegacyIds);

		//
		// Update the stop in the database

		await stopsCollection.updateOne({ _id: stopData._id }, { $set: { legacy_ids: newLegacyIds } });

		Logger.info(`Legacy IDs ensured for stop ${stopData._id} in ${stopTimer.get()}`);
	}

	Logger.info(`Legacy IDs ensured for all stops in ${timer.get()}`);
}
