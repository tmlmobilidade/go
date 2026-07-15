/* * */

import { generatePiperTtsAudio } from '@/services/piperTtsApi.js';
import TIMETRACKER from '@helperkits/timer';
import { files } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger-backend';
import pLimit from 'p-limit';

/* * */

const RUNNER_CONCURRENCY = Number(process.env.TTS_RUNNER_CONCURRENCY ?? 5);

const allCommonData = [
	{ id: 'next_stop', text: 'Seguinte' },
	{ id: 'last_stop', text: 'Fim de Percurso. ( Obrigado por viajar ) com a Carris Metropolitana!' },
	{ id: 'no_dropoff', text: 'Apenas permitido embarque.' },
];

async function deleteLegacyTtsFile(fileId: string) {
	const existingFile = await files.findOne({ _id: fileId });
	if (!existingFile) return;

	await files.deleteOne({ _id: fileId });
}

async function processCommon(commonIndex: number, total: number, commonData: typeof allCommonData[number]) {
	Logger.info({
		message: `[${commonIndex + 1}/${total}] Generating | ${commonData.id} | ${commonData.text}`,
	});

	const audioBuffer = await generatePiperTtsAudio({
		filename: commonData.id,
		force: true,
		resourceType: 'common',
		string: commonData.text,
	});

	await deleteLegacyTtsFile(commonData.id);
	await deleteLegacyTtsFile(`tts-${commonData.id}`);

	await files.upload(audioBuffer, {
		_id: `tts-${commonData.id}`,
		created_by: 'system',
		name: `${commonData.id}.mp3`,
		resource_id: 'tts/live/common',
		scope: 'static',
		size: audioBuffer.byteLength,
		type: 'audio/mpeg',
		updated_by: 'system',
	}, { override: true });
}

/* * */

export async function runnerCommon() {
	//

	Logger.title(`TTS COMMON`);
	const globalTimer = new TIMETRACKER();

	console.log(`* Preparing ${allCommonData.length} common sayings (${RUNNER_CONCURRENCY} concurrent)...`);
	console.log();

	const limit = pLimit(RUNNER_CONCURRENCY);

	await Promise.all(
		allCommonData.map((commonData, commonIndex) => limit(async () => {
			try {
				await processCommon(commonIndex, allCommonData.length, commonData);
			} catch (error) {
				Logger.error({
					message: `[${commonIndex + 1}/${allCommonData.length}] Failed ${commonData.id}: ${error instanceof Error ? error.message : String(error)}`,
				});
			}
		})),
	);

	Logger.success(`Processed ${allCommonData.length} "common" items (${globalTimer.get()}).`);

	//
};
