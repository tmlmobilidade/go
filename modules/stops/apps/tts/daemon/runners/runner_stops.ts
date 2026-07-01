/* * */

import { makeStop } from '@/utils/makeText.js';
import TIMETRACKER from '@helperkits/timer';
import { stops } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';

import { piperTtsApi } from '../services/piperTtsApi.js';

/* * */

export async function runnerStops() {
	//

	Logger.title(`TTS STOPS`);
	const globalTimer = new TIMETRACKER();

	console.log('* Fetching all stops from database...');
	const allStopsData = await stops.all();

	console.log(`* Preparing ${allStopsData.length} stops...`);
	console.log();

	for (const [stopIndex, stopData] of allStopsData.entries()) {
		//

		if (stopData.is_deleted) continue;

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

		const stopId = stopData._id.toString();
		if (stopTts && stopTts !== '#N/A') {
			Logger.info({
				message: `[${stopIndex + 1}/${allStopsData.length}] Generating for Stop ${stopData._id} - ${stopTts}`,
			});

			await piperTtsApi({
				filename: stopId,
				force: true,
				string: stopTts,
			});
		}

		//
	}

	Logger.success(`Processed ${allStopsData.length} "stops" items (${globalTimer.get()}).`);

	//
};
