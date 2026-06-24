/* * */

import TIMETRACKER from '@helperkits/timer';
import { Logger } from '@tmlmobilidade/logger';

import { piperTtsApi } from '../services/piperTtsApi.js';
import { Tracker } from '../services/Tracker.js';

/* * */

export async function runnerCommon() {
	//

	Logger.title(`TTS COMMON`);
	const globalTimer = new TIMETRACKER();

	const trackerData = Tracker.get('common');

	const allCommonData = [
		{ id: 'next_stop', text: 'Seguinte' },
		{ id: 'last_stop', text: 'Fim de Percurso. ( Obrigado por viajar ) com a Carris Metropolitana!' },
		{ id: 'no_dropoff', text: 'Apenas permitido embarque.' },
	];

	Logger.info({
		message: `Preparing ${allCommonData.length} common sayings...`,
	});

	for (const [commonIndex, commonData] of allCommonData.entries()) {
		const trackerEntry = trackerData.find(item => item.id === commonData.id);
		const ttsHasChanged = commonData.text !== trackerEntry?.tts;

		if (ttsHasChanged) {
			Logger.info({
				message: `[${commonIndex + 1}/${allCommonData.length}] Generating | ${commonData.id} | ${commonData.text}`,
			});

			await piperTtsApi({
				filename: commonData.id,
				force: true,
				string: commonData.text,
			});
		}

		if (ttsHasChanged || !trackerEntry) Tracker.upsert('common', { id: commonData.id, tts: commonData.text });
	}

	Logger.success(`Processed ${allCommonData.length} "common" items (${globalTimer.get()}).`);

	//
};
