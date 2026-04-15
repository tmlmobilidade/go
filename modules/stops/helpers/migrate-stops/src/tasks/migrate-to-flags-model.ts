/* * */

import { generateStopId } from '@tmlmobilidade/go-stops-pckg-id-engine';
import { stops } from '@tmlmobilidade/interfaces';
import { type Stop, validateStopIdStructure } from '@tmlmobilidade/types';

/* * */

export async function migrateToFlagsModel() {
	try {
		//

		const stopsData = await stops.findMany();

		for (const stopItem of stopsData) {
			//

			const updatedStop: Stop = { ...stopItem };
			if (!updatedStop.flags) updatedStop.flags = [];

			// MIgrate the stop ID
			let validatedStopId = validateStopIdStructure(stopItem.legacy_id);
			if (!validatedStopId) validatedStopId = await generateStopId();
			updatedStop._id = validatedStopId;

			// Migrate the flag
			updatedStop.flags.push({
				agency_ids: ['41', '42', '43', '44'],
				is_harmonized: validatedStopId === stopItem._id,
				short_name: updatedStop.short_name,
				stop_id: stopItem.legacy_id,
			});
		}

		//
	} catch (err) {
		console.error('Error migrating stops:', err);
		process.exit(1);
	}
}
