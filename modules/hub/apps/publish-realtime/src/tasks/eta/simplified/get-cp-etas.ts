/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { getCpTripUpdates } from '../gtfs/get-cp-trip-updates.js';
import { type TripStopEta } from '../types.js';
import { loadCpTripScheduleIndex } from './trip-schedule-index.js';
import { tripUpdatesToEtas } from './trip-updates-to-etas.js';

/* * */

async function getStopNames(stopIds: string[]): Promise<Map<string, string>> {
	if (!stopIds.length) return new Map();

	const stops = await goDb.infrastructure.stops.findMany(
		{ _id: { $in: stopIds.map(Number) } },
		{ projection: { _id: 1, name: 1 } },
	);

	return new Map(stops.map(stop => [String(stop._id), stop.name]));
};

/**
 * Builds simplified trip-stop ETAs from the CP GTFS-RT feed.
 *
 * Converts CP TripUpdates into `TripStopEta[]` using stop names and the CP
 * schedule index. Pass the result to {@link cacheEtasByTrip},
 * {@link cacheEtasByStop}, and {@link cacheEtasInAll} to merge into cache.
 */
export async function getCpEtas(): Promise<TripStopEta[]> {
	//

	const timer = new Timer();

	Logger.info({ message: 'Retrieving trip stop ETAs from CP API...' });

	const [tripUpdates, scheduleIndex] = await Promise.all([
		getCpTripUpdates(),
		loadCpTripScheduleIndex(),
	]);
	const stopIds = [...new Set(tripUpdates.flatMap(tripUpdate =>
		(tripUpdate.stop_time_update ?? [])
			.map(stopTimeUpdate => stopTimeUpdate.stop_id)
			.filter((stopId): stopId is string => Boolean(stopId)),
	))];
	const stopNames = await getStopNames(stopIds);
	const etas = tripUpdatesToEtas(tripUpdates, stopNames, scheduleIndex);

	Logger.info({ message: `Found ${etas.length} CP trip stop ETAs in ${timer.get()}`, spacesAfterOrBefore: 1 });

	return etas;

	//
};
