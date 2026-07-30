/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export function patternStopKey(patternId: string, stopId: string): string {
	return `${patternId}:${stopId}`;
}

/**
 * Loads stop_sequence for each (pattern_id, stop_id) pair from hashed_trips.path.
 */
export async function buildStopSequenceLookup(patternIds: string[]): Promise<Map<string, number>> {
	const stopSequenceByPatternAndStop = new Map<string, number>();

	if (patternIds.length === 0) {
		return stopSequenceByPatternAndStop;
	}

	const hashedTripsCollection = await goDb.operation.hashedTrips.getCollection();
	const hashedTripsCursor = hashedTripsCollection.find(
		{ pattern_id: { $in: patternIds } },
		{ projection: { path: { stop_id: 1, stop_sequence: 1 }, pattern_id: 1 } },
	).batchSize(10_000).stream();

	let hashedTripsProcessed = 0;
	for await (const hashedTrip of hashedTripsCursor) {
		hashedTripsProcessed++;

		for (const waypoint of hashedTrip.path) {
			stopSequenceByPatternAndStop.set(
				patternStopKey(hashedTrip.pattern_id, waypoint.stop_id),
				waypoint.stop_sequence,
			);
		}
	}

	Logger.info({
		message: `Built stop_sequence lookup from ${hashedTripsProcessed} hashed trips for ${patternIds.length} patterns (${stopSequenceByPatternAndStop.size} pattern-stop pairs)`,
	});

	return stopSequenceByPatternAndStop;
}
