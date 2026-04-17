/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { stops } from '@tmlmobilidade/interfaces';
import { type Stop, type StopId, validateStopIdStructure } from '@tmlmobilidade/types';
import { fetchData } from '@tmlmobilidade/utils';

/* * */

export async function migrateToFlagsModel() {
	try {
		//

		const stopsCollection = await stops.getCollection();

		const stopsStream = stopsCollection.find().stream();

		for await (const stopItem of stopsStream) {
			//

			console.log(`Migrating stop with legacy ID: ${stopItem.legacy_id}`);

			const updatedStop: Stop = { ...stopItem };

			// MIgrate the stop ID
			let validatedStopId = validateStopIdStructure(stopItem.legacy_id);
			if (!validatedStopId) {
				const newValidId = await fetchData<StopId>(API_ROUTES.stops.STOPS_VALID_ID);
				validatedStopId = newValidId.data;
			}

			updatedStop._id = validatedStopId;

			// Migrate the flag
			updatedStop.flags = [{
				agency_ids: ['41', '42', '43', '44'],
				is_harmonized: String(validatedStopId) === String(stopItem.legacy_id),
				short_name: updatedStop.name,
				stop_id: stopItem.legacy_id ?? String(updatedStop._id),
			}];

			updatedStop.legacy_ids = [stopItem.legacy_id];

			updatedStop.previous_go_id = stopItem._id;

			// updatedStop.legacy_id = null;

			//
			// Delete and re-insert the stop with the new ID and flags
			await stopsCollection.deleteOne({ _id: stopItem._id });
			await stopsCollection.insertOne(updatedStop);

			console.log(`Successfully migrated stop with legacy ID: ${stopItem.legacy_id} to new ID: ${validatedStopId}`);
			//
		}

		//
	} catch (err) {
		console.error('Error migrating stops:', err);
		process.exit(1);
	}
}
