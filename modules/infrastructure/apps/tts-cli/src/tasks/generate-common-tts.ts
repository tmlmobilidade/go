/* * */

import { generatePiperTtsAudio } from '@/services/piper-tts-api.js';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';
import pLimit from 'p-limit';

/* * */

const RUNNER_CONCURRENCY = Number(process.env.TTS_RUNNER_CONCURRENCY ?? 5);

const ALL_COMMON_DATA = [
	{ id: 'next_stop', text: 'Seguinte' },
	{ id: 'last_stop', text: 'Fim de Percurso. ( Obrigado por viajar ) com a Carris Metropolitana!' },
	{ id: 'no_dropoff', text: 'Apenas permitido embarque.' },
];

/* * */

/**
 * Deletes a legacy TTS file from storage, if it exists.
 * @param fileId The ID of the file to delete.
 */
async function deleteLegacyTtsFile(fileId: string) {
	const fileData = await storageProvider.findById(fileId);
	if (!fileData) return;
	await storageProvider.delete(fileId);
}

/**
 * Generates the TTS audio for a single common saying and stores it.
 * @param commonIndex The index of the saying in the list.
 * @param total The total number of sayings.
 * @param commonData The saying to generate.
 */
async function processCommon(commonIndex: number, total: number, commonData: typeof ALL_COMMON_DATA[number]) {
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

	await storageProvider.replace(audioBuffer, {
		_id: `tts-${commonData.id}`,
		created_by: 'system',
		name: `${commonData.id}.mp3`,
		resource_id: 'tts/live/common',
		scope: 'static',
		size: audioBuffer.byteLength,
		type: 'audio/mpeg',
		updated_by: 'system',
	});
}

/* * */

/**
 * Generates the TTS audio files for the common sayings
 * (next stop, last stop, no dropoff) and stores them.
 */
export async function generateCommonTtsTask() {
	//

	Logger.title('TTS COMMON');

	const globalTimer = new Timer();

	Logger.info({ message: `Preparing ${ALL_COMMON_DATA.length} common sayings (${RUNNER_CONCURRENCY} concurrent)...` });

	const limit = pLimit(RUNNER_CONCURRENCY);

	await Promise.all(
		ALL_COMMON_DATA.map((commonData, commonIndex) => limit(async () => {
			try {
				await processCommon(commonIndex, ALL_COMMON_DATA.length, commonData);
			} catch (error) {
				Logger.error({
					message: `[${commonIndex + 1}/${ALL_COMMON_DATA.length}] Failed ${commonData.id}: ${error instanceof Error ? error.message : String(error)}`,
				});
			}
		})),
	);

	Logger.success(`Processed ${ALL_COMMON_DATA.length} "common" items (${globalTimer.get()}).`);

	//
};
