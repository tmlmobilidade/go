/* * */

import { parseCsv, readGtfsFile, toNumberOrNull } from '@/helpers/index.js';
import { GtfsTMLStopTimes, GtfsTMLStopTimesSchema } from '@tmlmobilidade/types';

/* * */

export async function loadGtfsStopTimes(gtfsPath: string) {
	const content = await readGtfsFile(gtfsPath, 'stop_times.txt');
	const rawStopTimes = parseCsv<GtfsTMLStopTimes>(content);
	const stopTimes: GtfsTMLStopTimes[] = [];

	for (const raw of rawStopTimes) {
		try {
			const normalized = {
				...raw,
				drop_off_type: raw.drop_off_type ?? '0',
				pickup_type: raw.pickup_type ?? '0',
				shape_dist_traveled: toNumberOrNull(raw.shape_dist_traveled),
				stop_sequence: toNumberOrNull(raw.stop_sequence),
				timepoint: raw.timepoint ?? '0',
			} as GtfsTMLStopTimes;
			stopTimes.push(GtfsTMLStopTimesSchema.parse(normalized));
		} catch (error) {
			console.warn(`Skipping stop_time due to validation error: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	return stopTimes;
}

export function buildStopTimesByTrip(gtfsStopTimes: GtfsTMLStopTimes[]) {
	const stopTimesByTrip = new Map<string, GtfsTMLStopTimes[]>();
	for (const stopTime of gtfsStopTimes) {
		if (!stopTimesByTrip.has(stopTime.trip_id)) stopTimesByTrip.set(stopTime.trip_id, []);
		stopTimesByTrip.get(stopTime.trip_id)?.push(stopTime);
	}
	for (const [tripId, stopTimes] of stopTimesByTrip.entries()) {
		stopTimes.sort((a, b) => a.stop_sequence - b.stop_sequence);
		stopTimesByTrip.set(tripId, stopTimes);
	}
	return stopTimesByTrip;
}
