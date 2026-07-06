/* * */

import { patterns, stops } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';

import { generateStopId } from './generate-stop-id.js';

/* * */

export async function migrateStopIds() {
	//

	console.log();
	console.log('--------------------------------');
	console.log();

	//
	// Get all Stop documents from the database

	const stopsCollection = await stops.getCollection();

	const allStops = await stopsCollection
		.find({ 'flags.agency_ids': { $in: ['41', '42', '43', '44'] } })
		.toArray();

	const allStopsToMigrate = allStops.filter((stopData) => {
		const stopCmFlag = stopData.flags?.find(flag => flag.agency_ids.includes('41') || flag.agency_ids.includes('42') || flag.agency_ids.includes('43') || flag.agency_ids.includes('44'));
		if (stopCmFlag.stop_id === String(stopData._id)) return false;
		if (`3${stopCmFlag.stop_id.substring(1)}` === String(stopData._id)) return false;
		return true;
	});

	Logger.info({ message: `Found ${allStopsToMigrate.length} stops to migrate.` });

	//
	// Loop through all stops and request updated attributes for each document

	for (const stopData of allStopsToMigrate) {
		//

		console.log(stopData._id);

		// Check if the stop ID is already with the correct code

		const stopCmFlag = stopData.flags?.find(flag => flag.agency_ids.includes('41') || flag.agency_ids.includes('42') || flag.agency_ids.includes('43') || flag.agency_ids.includes('44'));

		if (stopCmFlag.stop_id === String(stopData._id)) continue;

		// If not, update the stop ID

		if (!stopCmFlag.stop_id.startsWith('0')) {
			console.log('Stop ID is not a CM stop ID');
			continue;
		}

		const newStopId = `3${stopCmFlag.stop_id.substring(1)}`;

		const existsStop = await stopsCollection.findOne({ _id: Number(newStopId) });

		if (existsStop) {
			// If a stop ID already exists, move it to another random one
			const randomStopId = await generateStopId();
			const newExistsStopLegacyIds = existsStop.legacy_ids.map(legacyId => legacyId.replace(String(existsStop._id), String(randomStopId)));
			console.log('Stop ID already exists:', existsStop._id, '->', randomStopId);
			await stopsCollection.insertOne({ ...existsStop, _id: randomStopId, legacy_ids: newExistsStopLegacyIds });
			await stopsCollection.deleteOne({ _id: existsStop._id });
			Logger.info({ message: `Moved Stop ${existsStop._id} to ${randomStopId}` });
		}

		console.log('Stop ID does not exist:', stopData._id, '->', stopCmFlag.stop_id, '->', newStopId);

		const newStopLegacyIds = stopData.legacy_ids.map(legacyId => legacyId.replace(String(stopData._id), String(newStopId)));
		await stopsCollection.insertOne({ ...stopData, _id: Number(newStopId), legacy_ids: newStopLegacyIds, previous_go_id: String(stopData._id) });
		await stopsCollection.deleteOne({ _id: stopData._id });

		Logger.info({ message: `Migrated Stop ${stopData._id} to ${newStopId}` });

		//
		// Migrate pattern IDs that use the old stop ID

		const patternsCollection = await patterns.getCollection();
		const allMatchingPatterns = await patternsCollection.find({ 'path.stop_id': stopData._id }).toArray();

		console.log('Found', allMatchingPatterns.length, 'patterns to migrate');

		console.log('+++');
		for (const patternData of allMatchingPatterns) {
			console.log(patternData._id);
			patternData.path.map((path) => {
				if (path.stop_id === stopData._id) path.stop_id = Number(newStopId);
				return { ...path, stop: undefined };
			});
			patternData.parameters.map((parameter) => {
				return parameter.path.map((path) => {
					if (path.stop_id === stopData._id) path.stop_id = Number(newStopId);
					return { ...path, stop: undefined };
				});
			});
			await patternsCollection.updateOne({ _id: patternData._id }, { $set: patternData });
			console.log('Migrated pattern:', patternData._id);
		}
		console.log('+++');

		// Wait 300ms
		// await new Promise(resolve => setTimeout(resolve, 2000));

		//
		// Recursively migrate the next stop ID

		await migrateStopIds();
		return;

		//
	}

	//
}
