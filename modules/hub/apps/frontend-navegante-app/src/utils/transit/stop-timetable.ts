import { type PreparedTripUpdate } from '@/hooks/transit/use-eta-data';
import { type HubV1ApiPattern } from '@tmlmobilidade/go-types-hub';
import { type OperationalDateInt, OperationalTimeSchema, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { Dates, fromOperationalDateTimeToUnixMilliseconds } from '@tmlmobilidade/go-utils-dates';

/* * */

export interface StopsDetailViewTimetableData {
	_id: string
	agency_id: string
	arrival_delay_ms: number
	arrival_effective_ms: null | UnixMilliseconds
	arrival_estimated_ms: null | UnixMilliseconds
	arrival_scheduled_ms: UnixMilliseconds
	color: string
	headsign: string
	is_first_stop: boolean
	is_last_stop: boolean
	is_past: boolean
	is_realtime: boolean
	line_id: string
	locality_names: string[]
	pattern_id: string
	shape_id: string
	short_name: string
	stop_sequence: number
	text_color: string
	trip_ids: string[]
	tts_headsign: string
}

/* * */

export function buildStopTimetable({ isTodaySelected, selectedOperationalDate, stopEtas, stopId, validPatterns }: {
	isTodaySelected: boolean
	selectedOperationalDate: null | OperationalDateInt
	stopEtas: PreparedTripUpdate[]
	stopId: string
	validPatterns: HubV1ApiPattern[] | undefined
}): StopsDetailViewTimetableData[] {
	if (!validPatterns || !selectedOperationalDate) return [];

	const timetable: StopsDetailViewTimetableData[] = [];
	for (const pattern of validPatterns) {
		for (const trip of pattern.trips) {
			if (!trip.valid_on.includes(selectedOperationalDate)) continue;

			for (const stopTime of trip.schedule) {
				if (String(stopTime.stop_id) !== String(stopId)) continue;

				const tripUpdate = isTodaySelected ? stopEtas.find(eta => eta.trip_id.substring(eta.trip_id.indexOf(']') + 1) === trip.trip_ids.find(tripId => tripId.substring(tripId.indexOf(']') + 1) === eta.trip_id.substring(eta.trip_id.indexOf(']') + 1))?.substring(eta.trip_id.indexOf(']') + 1)) : undefined;
				const arrivalScheduledMs = fromOperationalDateTimeToUnixMilliseconds({ operational_date: selectedOperationalDate, operational_time: OperationalTimeSchema.parse(stopTime.arrival_time), timezone: 'Europe/Lisbon' });
				const arrivalEstimatedMs: null | UnixMilliseconds = tripUpdate?.eta_at ? Number(tripUpdate.eta_at) as UnixMilliseconds : null;
				const arrivalDelayMs = tripUpdate ? tripUpdate.eta_seconds * 1000 : 0;
				const arrivalEffectiveMs: UnixMilliseconds = arrivalEstimatedMs ?? arrivalScheduledMs;

				timetable.push({
					_id: `${selectedOperationalDate}-${pattern.version_id}-${trip.version_id}-${stopTime.stop_id}-${stopTime.stop_sequence}-${stopTime.arrival_time}`,
					agency_id: pattern.agency_id,
					arrival_delay_ms: arrivalDelayMs,
					arrival_effective_ms: arrivalEffectiveMs,
					arrival_estimated_ms: arrivalEstimatedMs,
					arrival_scheduled_ms: arrivalScheduledMs,
					color: pattern.color,
					headsign: pattern.headsign,
					is_first_stop: stopTime.stop_sequence === pattern.path[0].stop_sequence,
					is_last_stop: stopTime.stop_sequence === pattern.path[pattern.path.length - 1].stop_sequence,
					is_past: Number(arrivalEffectiveMs) < Dates.now('Europe/Lisbon').unix_milliseconds,
					is_realtime: arrivalEstimatedMs !== null && isTodaySelected,
					line_id: pattern.line_id,
					locality_names: pattern.locality_names,
					pattern_id: pattern._id,
					shape_id: pattern.shape_id,
					short_name: pattern.short_name,
					stop_sequence: stopTime.stop_sequence,
					text_color: pattern.text_color,
					trip_ids: trip.trip_ids,
					tts_headsign: pattern.tts_headsign,
				});
			}
		}
	}

	return timetable.sort((a, b) => Number(a.arrival_effective_ms) - Number(b.arrival_effective_ms));
}
