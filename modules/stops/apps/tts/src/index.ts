/* * */

// import { generateStopTts } from '@tmlmobilidade/go-stops-pckg-tts';
import { stops } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

async function main() {
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

		Logger.info(`[${allStopsData.length - stopIndex}/${allStopsData.length}] Processing Stop ${stopData._id}...`);

		// const organizedStopData = await organizeStop(stopData);

		// await stops.updateById(stopData._id, organizedStopData);

		//
	}

	Logger.terminate(`Organization completed in ${globalTimer.get()}`);

	//
}

await runOnInterval(main, { intervalMs: '5m' });
