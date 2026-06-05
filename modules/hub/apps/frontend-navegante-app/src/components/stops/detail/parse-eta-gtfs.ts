/* * */

import { type HubArrival, type HubGtfsRtFeedEntity, type HubGtfsRtTripUpdate, type HubPattern, type HubPatternRealtime } from '@tmlmobilidade/types';
import { DateTime } from 'luxon';

/* * */

export type StopTimetableRealtimeArrival = HubPatternRealtime & {
	rowStatus: 'realtime' | 'scheduled'
};

/** Called from: StopsDetailContentTimetableRow, StopsDetailContentTimetableRealtime */
export function isRealtimeArrival(
	data: HubArrival | StopTimetableRealtimeArrival,
): data is StopTimetableRealtimeArrival {
	return typeof (data as StopTimetableRealtimeArrival).scheduled_arrival_unix === 'number';
}

/** GTFS feed only lists active trips with a future ETA. */
export function getFutureRowStatus(
	data: HubArrival | StopTimetableRealtimeArrival,
): 'realtime' | 'scheduled' {
	if (!isRealtimeArrival(data) || data.estimated_arrival_unix == null) return 'scheduled';
	return data.estimated_arrival_unix >= DateTime.now().toSeconds() ? 'realtime' : 'scheduled';
}

/* * */

/**
 * Derive timetable row display mode from GTFS stop_time_update.schedule_relationship.
 *
 * Called from: parseEtaGtfsForStop
 */
export function stopTimeUpdateToRowStatus(scheduleRelationship?: null | string): 'realtime' | 'scheduled' {
	return scheduleRelationship === 'SCHEDULED' ? 'scheduled' : 'realtime';
}

/**
 * Match a trip_id from the GTFS feed to a loaded pattern group.
 *
 * Called from: parseEtaGtfsForStop
 */
export function normalizeTripIdForMatch(tripId: string): string {
	return tripId.replace(/^\[[^\]]+\]/, '');
}

export function findPatternForTrip(patterns: HubPattern[] | undefined, tripId: string): HubPattern | undefined {
	if (!patterns) return undefined;

	const normalizedTripId = normalizeTripIdForMatch(tripId);

	for (const pattern of patterns) {
		for (const trip of pattern.trips) {
			if (trip.trip_ids.includes(tripId)) {
				return pattern;
			}
			if (trip.trip_ids.some(id => normalizeTripIdForMatch(id) === normalizedTripId)) {
				return pattern;
			}
		}
	}

	return undefined;
}

/**
 * Normalize a feed entity into a trip update (hub wraps in trip_update; CP may not).
 *
 * Called from: parseEtaGtfsForStop
 */
function getTripUpdateFromEntity(entity: HubGtfsRtFeedEntity): HubGtfsRtTripUpdate | undefined {
	if (entity.trip_update?.stop_time_update?.length) {
		return entity.trip_update;
	}

	if (entity.stop_time_update?.length) {
		return {
			stop_time_update: entity.stop_time_update,
			timestamp: entity.timestamp,
			trip: entity.trip,
			vehicle: entity.vehicle,
		};
	}

	return entity.trip_update ?? undefined;
}

/**
 * Extract live arrival rows for a single stop from the GTFS-RT ETA feed.
 *
 * Called from: StopsDetailContextProvider realtime fetch effect
 */
export function parseEtaGtfsForStop(
	entities: HubGtfsRtFeedEntity[],
	stopId: string,
	patterns: HubPattern[] | undefined,
): StopTimetableRealtimeArrival[] {
	const results: StopTimetableRealtimeArrival[] = [];

	for (const entity of entities) {
		// 1. Normalize trip update (hub wraps in trip_update; CP may not)
		const tripUpdate = getTripUpdateFromEntity(entity);
		const tripId = tripUpdate?.trip?.trip_id;
		if (!tripId || !tripUpdate?.stop_time_update?.length) continue;

		for (const stopUpdate of tripUpdate.stop_time_update) {
			// 2. Keep only updates for the selected stop
			if (String(stopUpdate.stop_id) !== String(stopId)) continue;

			// 3. Read live arrival (stop_sequence identifies this stop on the trip)
			const time = stopUpdate.arrival?.time ?? null;
			const delay = stopUpdate.arrival?.delay ?? null;
			if (time == null) continue;

			// 4. Compute display timestamps
			const estimatedArrivalUnix = time;
			const scheduledArrivalUnix = delay != null ? time - delay : time;

			// 5. Row display mode from schedule_relationship
			const rowStatus = stopTimeUpdateToRowStatus(stopUpdate.schedule_relationship);

			// 6. Enrich line/pattern info from loaded patterns
			const pattern = findPatternForTrip(patterns, tripId);
			if (!pattern) continue;

			const stopSequence = stopUpdate.stop_sequence ?? 0;

			results.push({
				estimated_arrival: DateTime.fromSeconds(estimatedArrivalUnix).toFormat('HH:mm:ss'),
				estimated_arrival_unix: estimatedArrivalUnix,
				headsign: pattern.headsign,
				line_id: pattern.line_id,
				observed_arrival: null,
				observed_arrival_unix: null,
				pattern_id: pattern.id,
				route_id: pattern.route_id,
				rowStatus,
				scheduled_arrival: DateTime.fromSeconds(scheduledArrivalUnix).toFormat('HH:mm:ss'),
				scheduled_arrival_unix: scheduledArrivalUnix,
				stop_id: String(stopId),
				stop_sequence: stopSequence,
				trip_id: tripId,
				vehicle_id: tripUpdate.vehicle?.id ?? null,
			});
		}
	}

	return results;
}
