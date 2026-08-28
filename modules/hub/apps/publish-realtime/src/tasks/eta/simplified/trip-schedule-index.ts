/* * */

import { Dates } from '@tmlmobilidade/go-utils-dates';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type HubLine, type HubPattern, type HubScheduledArrival } from '@tmlmobilidade/go-types-hub';

/* * */

const CP_AGENCY_ID = 'N18KL';

export type TripScheduleIndex = Map<string, { stops: Map<number, HubScheduledArrival>, valid_on: string[] }[]>;

export function parsePublicTripId(publicTripId: string): undefined | { agencyId: string, planId: string, tripId: string } {
	const match = publicTripId.match(/^\[([^\]]+)\]\[([^\]]+)\](.+)$/);
	if (!match) return undefined;

	return { agencyId: match[2], planId: match[1], tripId: match[3] };
};

export function parseServiceDateFromTripId(tripId: string): string | undefined {
	return tripId.match(/_(\d{8})$/)?.[1];
};

function gtfsArrivalTimeToUnixMs(operationalDate: string, arrivalTime: string): number {
	const [hours, minutes, seconds = 0] = arrivalTime.split(':').map(Number);

	return Dates.fromOperationalDate(operationalDate, 'Europe/Lisbon')
		.plus({ hours, minutes, seconds })
		.unix_timestamp;
};

function indexPatterns(patternGroups: HubPattern[]): TripScheduleIndex {
	const index: TripScheduleIndex = new Map();

	for (const patternGroup of patternGroups) {
		for (const trip of patternGroup.trips) {
			const stops = new Map(trip.schedule.map(schedule => [schedule.stop_sequence, schedule]));

			for (const tripId of trip.trip_ids) {
				const entries = index.get(tripId) ?? [];
				entries.push({ stops, valid_on: trip.valid_on });
				index.set(tripId, entries);
			}
		}
	}

	return index;
};

export async function loadCpTripScheduleIndex(): Promise<TripScheduleIndex> {
	const linesRaw = await cacheDb.get('hub:v1:network:lines');
	if (!linesRaw) return new Map();

	const cpPatternIds = [...new Set(
		(JSON.parse(linesRaw) as HubLine[])
			.filter(line => line.agency_id === CP_AGENCY_ID)
			.flatMap(line => line.pattern_ids),
	)];

	const patternGroups = (await Promise.all(cpPatternIds.map(async (patternId) => {
		const raw = await cacheDb.get(`hub:v1:network:patterns:${patternId}`);
		return raw ? JSON.parse(raw) as HubPattern[] : [];
	}))).flat();

	return indexPatterns(patternGroups);
};

export function getScheduledArrival(
	scheduleIndex: TripScheduleIndex,
	tripId: string,
	operationalDate: string,
	stopSequence?: number,
	stopId?: string,
): HubScheduledArrival | undefined {
	const entry = scheduleIndex.get(tripId)?.find(item => item.valid_on.includes(operationalDate));
	if (!entry) return undefined;

	if (stopSequence != null && entry.stops.has(stopSequence)) {
		return entry.stops.get(stopSequence);
	}

	if (stopId) {
		return [...entry.stops.values()].find(schedule => schedule.stop_id === stopId);
	}

	return undefined;
};

export function getScheduledArrivalUnix(
	scheduleIndex: TripScheduleIndex,
	tripId: string,
	stopSequence: number,
	operationalDate: string,
	stopId?: string,
): number | undefined {
	const schedule = getScheduledArrival(scheduleIndex, tripId, operationalDate, stopSequence, stopId);
	if (!schedule) return undefined;

	return Math.floor(gtfsArrivalTimeToUnixMs(operationalDate, schedule.arrival_time) / 1000);
};

export function resolveOperationalDate(tripId: string): string {
	return parseServiceDateFromTripId(parsePublicTripId(tripId)?.tripId ?? tripId) ?? Dates.now('Europe/Lisbon').operational_date;
};
