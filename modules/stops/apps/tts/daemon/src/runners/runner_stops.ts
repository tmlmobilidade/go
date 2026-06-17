/* * */

import { makeStop } from '@/lib/index.js';
import TIMETRACKER from '@helperkits/timer';
import { Logger } from '@tmlmobilidade/logger';
import { HubStop } from '@tmlmobilidade/types';

import { Tracker, type TrackerItem } from '../services/Tracker.js';

/* * */

export async function runnerStops() {
	//

	Logger.title(`TTS STOPS`);
	const globalTimer = new TIMETRACKER();

	// Setup tracker
	const trackerData = Tracker.get('stops');
	const trackerDataUpdated: TrackerItem[] = [];

	// Get all stops
	console.log('* Fetching all stops from API...');
	const allStopsResponse = await fetch('https://api.carrismetropolitana.pt/v2/stops');
	const allStopsData = await allStopsResponse.json() as HubStop[];

	// Log progress
	console.log(`* Preparing ${allStopsData.length} stops...`);
	console.log();

	// Iterate on each stop
	for (const [stopIndex, stopData] of allStopsData.entries()) {
		//

		const stopTts = makeStop(stopData.name, {
			airport: stopData.flags.some(flag => flag.short_name === 'airport'),
			bike_parking: stopData.flags.some(flag => flag.short_name === 'bike_parking'),
			bike_sharing: stopData.flags.some(flag => flag.short_name === 'bike_sharing'),
			boat: stopData.flags.some(flag => flag.short_name === 'boat'),
			car_parking: stopData.flags.some(flag => flag.short_name === 'car_parking'),
			light_rail: stopData.flags.some(flag => flag.short_name === 'light_rail'),
			subway: stopData.flags.some(flag => flag.short_name === 'subway'),
			train: stopData.flags.some(flag => flag.short_name === 'train'),
		});

		// Check if tracker already has this entry,
		// and if it differs from the given TTS.
		const trackerEntry = trackerData.find(item => item.id === stopData._id.toString());
		const ttsHasChanged = stopTts !== trackerEntry?.tts;

		if (ttsHasChanged && stopTts && stopTts !== '#N/A') {
			Logger.info(`[${stopIndex}/${allStopsData.length}] Generating for Stop ${stopData._id} - ${stopTts}`);
		// TODO: Send to new endpoint
		}

		trackerDataUpdated.push({ id: stopData._id.toString(), tts: stopTts });

		//
	}

	// Save updated tracker
	Tracker.set('stops', trackerDataUpdated);

	// Clean directory
	Tracker.clean('stops');

	// Zip directory
	Tracker.zip('stops');

	//

	Logger.success(`Processed ${trackerDataUpdated.length} "stops" items (${globalTimer.get()}).`);

	//
};
