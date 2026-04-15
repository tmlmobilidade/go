/* * */

import { generateStopId } from '@tmlmobilidade/go-stops-pckg-id-engine';
import { stops } from '@tmlmobilidade/interfaces';
import { type Stop, validateStopIdStructure } from '@tmlmobilidade/types';

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
			if (!updatedStop.flags) updatedStop.flags = [];

			// MIgrate the stop ID
			let validatedStopId = validateStopIdStructure(stopItem.legacy_id);
			if (!validatedStopId) validatedStopId = await generateStopId();
			updatedStop._id = validatedStopId;

			// Migrate the flag
			updatedStop.flags.push({
				agency_ids: ['41', '42', '43', '44'],
				is_harmonized: String(validatedStopId) === String(stopItem.legacy_id),
				short_name: updatedStop.name,
				stop_id: stopItem.legacy_id,
			});

			updatedStop.legacy_ids = [stopItem.legacy_id];

			updatedStop.previous_go_id = stopItem._id;

			updatedStop.legacy_id = null;

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
