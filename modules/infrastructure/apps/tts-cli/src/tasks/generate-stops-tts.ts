/* * */

import { generatePiperTtsAudio } from '@/services/piper-tts-api.js';
import { deleteOldTtsFile } from '@/utils/delete-old-tts-file.js';
import { generateHash } from '@/utils/generate-hash.js';
import { makeStop } from '@/utils/make-text.js';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type Stop } from '@tmlmobilidade/go-types-infrastructure';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';
import pLimit from 'p-limit';

/* * */

const RUNNER_CONCURRENCY = Number(process.env.TTS_RUNNER_CONCURRENCY ?? 5);

/* * */

/**
 * Generates the TTS audio for a single stop, stores it
 * and saves the resulting hash in the stop document.
 * @param stopIndex The index of the stop in the list.
 * @param total The total number of stops.
 * @param stopData The stop to generate.
 */
async function processStop(stopIndex: number, total: number, stopData: Stop) {
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

	if (!stopTts || stopTts === '#N/A') return;

	const stopId = stopData._id.toString();
	const hash = await generateHash(stopTts, stopId);

	if (stopData.tts_hash === hash) {
		Logger.info({
			message: `[${stopIndex + 1}/${total}] Skipping Stop ${stopData._id} - TTS already exists`,
		});
		return;
	}

	Logger.info({
		message: `[${stopIndex + 1}/${total}] Generating for Stop ${stopData._id} - ${stopTts}`,
	});

	const audioBuffer = await generatePiperTtsAudio({
		filename: stopId,
		force: true,
		resourceType: 'stops',
		string: stopTts,
	});

	await deleteOldTtsFile(stopId);
	await deleteOldTtsFile(`tts-${stopId}`);

	await storageProvider.replace(audioBuffer, {
		_id: `tts-${stopId}`,
		created_by: 'system',
		name: `${hash}.mp3`,
		resource_id: 'tts/live/stops',
		scope: 'static',
		size: audioBuffer.byteLength,
		type: 'audio/mpeg',
		updated_by: 'system',
	});

	await goDb.infrastructure.stops.updateById(stopData._id, { tts_hash: hash });
}

/* * */

/**
 * Generates the TTS audio files for every non-deleted stop
 * in the database and stores them.
 */
export async function generateStopsTtsTask() {
	//

	Logger.title('TTS STOPS');

	const globalTimer = new Timer();

	Logger.info({ message: 'Fetching all stops from database...' });

	const allStopsData = await goDb.infrastructure.stops.findMany();
	const stopsToProcess = allStopsData.filter(stopData => !stopData.is_deleted);

	Logger.info({ message: `Preparing ${stopsToProcess.length} stops (${RUNNER_CONCURRENCY} concurrent)...` });

	const limit = pLimit(RUNNER_CONCURRENCY);

	await Promise.all(
		stopsToProcess.map((stopData, stopIndex) => limit(async () => {
			try {
				await processStop(stopIndex, stopsToProcess.length, stopData);
			} catch (error) {
				Logger.error({
					message: `[${stopIndex + 1}/${stopsToProcess.length}] Failed Stop ${stopData._id}: ${error instanceof Error ? error.message : String(error)}`,
				});
			}
		})),
	);

	Logger.success(`Processed ${stopsToProcess.length} "stops" items (${globalTimer.get()}).`);

	//
};
