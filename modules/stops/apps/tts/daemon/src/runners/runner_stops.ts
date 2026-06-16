/* * */

import { SETTINGS } from '@/config/settings.js';
import { googleCloudTtsApi } from '@/services/googleCloudTtsApi.js';
import { Tracker, type TrackerItem } from '@/services/Tracker.js';
import { type Stop } from '@carrismetropolitana/api-types/network';
import tts from '@carrismetropolitana/tts';
import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';

/* * */

export async function runnerStops() {
	//

	LOGGER.title(`TTS STOPS`);
	const globalTimer = new TIMETRACKER();

	// Setup tracker
	const trackerData = Tracker.get('stops');
	const trackerDataUpdated: TrackerItem[] = [];

	// Get all stops
	console.log('* Fetching all stops from API...');
	const allStopsResponse = await fetch('https://api.carrismetropolitana.pt/v2/stops');
	const allStopsData = await allStopsResponse.json() as Stop[];

	// Log progress
	console.log(`* Preparing ${allStopsData.length} stops...`);
	console.log();

	// Iterate on each stop
	for (const [stopIndex, stopData] of allStopsData.entries()) {
		//

		const stopTts = tts.makeStop(stopData.long_name, {
			airport: stopData.facilities.includes('airport'),
			bike_parking: stopData.facilities.includes('bike_parking'),
			bike_sharing: stopData.facilities.includes('bike_sharing'),
			boat: stopData.facilities.includes('boat'),
			car_parking: stopData.facilities.includes('car_parking'),
			light_rail: stopData.facilities.includes('light_rail'),
			subway: stopData.facilities.includes('subway'),
			train: stopData.facilities.includes('train'),
		});

		// Check if tracker already has this entry,
		// and if it differs from the given TTS.
		const trackerEntry = trackerData.find(item => item.id === stopData.id);
		const ttsHasChanged = stopTts !== trackerEntry?.tts;

		if (ttsHasChanged && stopTts && stopTts !== '#N/A') {
			LOGGER.info(`[${stopIndex}/${allStopsData.length}] Generating for Stop ${stopData.id} - ${stopTts}`);
			await googleCloudTtsApi({
				dirname: `${SETTINGS.OUTPUTS_DIRNAME}/stops`,
				filename: stopData.id,
				replaceIfExists: true,
				string: stopTts,
			});
		}

		trackerDataUpdated.push({ id: stopData.id, tts: stopTts });

		//
	}

	// Save updated tracker
	Tracker.set('stops', trackerDataUpdated);

	// Clean directory
	Tracker.clean('stops');

	// Zip directory
	Tracker.zip('stops');

	//

	LOGGER.success(`Processed ${trackerDataUpdated.length} "stops" items (${globalTimer.get()}).`);

	//
};
