/* * */

import TIMETRACKER from '@helperkits/timer';
import { Logger } from '@tmlmobilidade/logger';

import { piperTtsApi } from '../services/piperTtsApi.js';
import { Tracker, type TrackerItem } from '../services/Tracker.js';

/* * */

const OUTPUTS_DIRNAME = './outputs/common';

export async function runnerCommon() {
	//

	Logger.title(`TTS COMMON`);
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

	Logger.info(`Preparing ${allCommonData.length} common sayings...`);

	// Iterate on each common saying
	for (const [commonIndex, commonData] of allCommonData.entries()) {
		// Check if tracker already has this entry and if it differs from the given TTS.
		const trackerEntry = trackerData.find(item => item.id === commonData.id);
		const ttsHasChanged = commonData.text !== trackerEntry?.tts;
		// If the entry does not exist, or if the TTS has changed, we need to generate a new TTS file.
		if (ttsHasChanged) {
			Logger.info(`[${commonIndex + 1}/${allCommonData.length}] Generating | ${commonData.id} | ${commonData.text}`);

			await piperTtsApi({
				dirname: OUTPUTS_DIRNAME,
				filename: commonData.id,
				force: true,
				string: commonData.text,
			});
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

	Logger.success(`Processed ${trackerDataUpdated.length} "common" items (${globalTimer.get()}).`);

	//
};
