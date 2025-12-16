/* * */

import { normalizeStop } from '@tmlmobilidade/go-stops-pckg-normalize';
import { stops } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

(async function init() {
	const runOnInterval = async () => {
		//

		Logger.init();

		const globalTimer = new Timer();

		//
		// Get all Stop documents from the database

		const allStopsData = await stops.all();

		Logger.info(`Found ${allStopsData.length} stops.`);

		//
		// Loop through all stops and request updated attributes for each document

		for (const [stopIndex, stopData] of allStopsData.entries()) {
			//

			Logger.title(`[${allStopsData.length - stopIndex}/${allStopsData.length}] Processing Stop ${stopData._id}...`);

			const normalizedStopData = await normalizeStop(stopData);

			await stops.updateById(stopData._id, normalizedStopData);

			Logger.divider();

			//
		}

		Logger.terminate(`Organization completed in ${globalTimer.get()}`);

		//

		setTimeout(runOnInterval, 300_000); // 5 minutes in milliseconds
	};
	runOnInterval();
})();
