/* * */

import { generatePiperTtsAudio } from '@/services/piperTtsApi.js';
import { makeStop } from '@/utils/makeText.js';
import TIMETRACKER from '@helperkits/timer';
import { files, stops } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import pLimit from 'p-limit';

/* * */

const RUNNER_CONCURRENCY = Number(process.env.TTS_RUNNER_CONCURRENCY ?? 5);

async function deleteLegacyTtsFile(fileId: string) {
	const existingFile = await files.findOne({ _id: fileId });
	if (!existingFile) return;

	await files.deleteOne({ _id: fileId });
}

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

	Logger.info({
		message: `[${stopIndex + 1}/${total}] Generating for Stop ${stopData._id} - ${stopTts}`,
	});

	const audioBuffer = await generatePiperTtsAudio({
		filename: stopId,
		force: true,
		string: stopTts,
	});

	await deleteLegacyTtsFile(stopId);
	await deleteLegacyTtsFile(`tts-${stopId}`);

	await files.upload(audioBuffer, {
		_id: `tts-${stopId}`,
		created_by: 'system',
		name: `${stopData.tts_hash}.mp3`,
		resource_id: 'tts/live/stops',
		scope: 'static',
		size: audioBuffer.byteLength,
		type: 'audio/mpeg',
		updated_by: 'system',
	}, { override: true });
}

/* * */

export async function runnerStops() {
	//

	Logger.title(`TTS STOPS`);
	const globalTimer = new TIMETRACKER();

	console.log('* Fetching all stops from database...');
	const allStopsData = await stops.all();
	const stopsToProcess = allStopsData.filter(stopData => !stopData.is_deleted);

	console.log(`* Preparing ${stopsToProcess.length} stops (${RUNNER_CONCURRENCY} concurrent)...`);

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
