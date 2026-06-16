/* * */

import { SETTINGS } from '@/config/settings.js';
import { googleCloudTtsApi } from '@/services/googleCloudTtsApi.js';
import { Tracker, type TrackerItem } from '@/services/Tracker.js';
import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';

/* * */

export async function runnerCommon() {
	//

	LOGGER.title(`TTS COMMON`);
	const globalTimer = new TIMETRACKER();

	// Setup tracker
	const trackerData = Tracker.get('common');
	const trackerDataUpdated: TrackerItem[] = [];

	// Define common sayings
	const allCommonData = [
		{ id: 'next_stop', text: 'Seguinte' },
		{ id: 'last_stop', text: 'Fim de Percurso. ( Obrigado por viajar ) com a Carris Metropolitana!' },
		{ id: 'no_dropoff', text: 'Apenas permitido embarque.' },
	];

	LOGGER.info(`Preparing ${allCommonData.length} common sayings...`);

	// Iterate on each common saying
	for (const [commonIndex, commonData] of allCommonData.entries()) {
		// Check if tracker already has this entry and if it differs from the given TTS.
		const trackerEntry = trackerData.find(item => item.id === commonData.id);
		const ttsHasChanged = commonData.text !== trackerEntry?.tts;
		// If the entry does not exist, or if the TTS has changed, we need to generate a new TTS file.
		if (ttsHasChanged) {
			await googleCloudTtsApi({ dirname: `${SETTINGS.OUTPUTS_DIRNAME}/common`, filename: commonData.id, replaceIfExists: true, string: commonData.text });
			console.log(`* [${commonIndex}/${allCommonData.length}] Generated | Stop ${commonData.id} | ${commonData.text}`);
		}
		// Push the updated entry to the tracker data array.
		trackerDataUpdated.push({ id: commonData.id, tts: commonData.text });
	}

	// Save updated tracker
	Tracker.set('common', trackerDataUpdated);

	// Clean directory
	Tracker.clean('common');

	// Zip directory
	Tracker.zip('common');

	//

	LOGGER.success(`Processed ${trackerDataUpdated.length} "common" items (${globalTimer.get()}).`);

	//
};
