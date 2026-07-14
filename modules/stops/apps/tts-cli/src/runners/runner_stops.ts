/* * */

import { generatePiperTtsAudio } from '@/services/piperTtsApi.js';
import { deleteOldTtsFile } from '@/utils/deleteOldTTSFile.js';
import { generateHash } from '@/utils/generateHash.js';
import { makeStop } from '@/utils/makeText.js';
import TIMETRACKER from '@helperkits/timer';
import { files, stops } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import pLimit from 'p-limit';

/* * */

const TEST_STOP_IDS = new Set([
	100340,
	100341,
	100343,
	100344,
	100345,
	100347,
	100348,
	100349,
]);

/* * */

async function processStop(stopIndex: number, total: number, stopData: Awaited<ReturnType<typeof stops.all>>[number]) {
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
		string: stopTts,
	});

	await deleteOldTtsFile(stopId);
	await deleteOldTtsFile(`tts-${stopId}`);

	await files.upload(audioBuffer, {
		_id: `tts-${stopId}`,
		created_by: 'system',
		name: `${hash}.mp3`,
		resource_id: 'tts/live/stops',
		scope: 'static',
		size: audioBuffer.byteLength,
		type: 'audio/mpeg',
		updated_by: 'system',
	}, { override: true });

	await stops.updateById(stopData._id, { tts_hash: hash }, { forceIfLocked: true });
}

/* * */

export async function runnerStops() {
	//

	Logger.title(`TTS STOPS`);
	const globalTimer = new TIMETRACKER();

	console.log('* Fetching all stops from database...');
	const allStopsData = await stops.all();
	const stopsToProcess = allStopsData.filter(stopData => !stopData.is_deleted && TEST_STOP_IDS.has(stopData._id));

	console.log(`* Preparing ${stopsToProcess.length} stops (${process.env.TTS_RUNNER_CONCURRENCY} concurrent)...`);

	const limit = pLimit(Number(process.env.TTS_RUNNER_CONCURRENCY));

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
