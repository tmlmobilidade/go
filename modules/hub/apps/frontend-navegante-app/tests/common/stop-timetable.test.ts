import { type PreparedTripUpdate } from '@/hooks/transit/use-eta-data';
import { buildStopTimetable } from '@/utils/transit/stop-timetable';
import { HubV1ApiPatternSchema } from '@tmlmobilidade/go-types-hub';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

/* * */

const today = Dates.now('Europe/Lisbon').operational_date_int;
const tomorrow = Dates.fromOperationalDateInt(today, 'Europe/Lisbon').plus({ days: 1 }).operational_date_int;
const futureDate = Dates.fromOperationalDateInt(today, 'Europe/Lisbon').plus({ days: 7 }).operational_date_int;
const liveEta: PreparedTripUpdate = {
	eta_at: Date.now() - 3_600_000,
	eta_seconds: 120,
	stop_id: 'stop-1',
	stop_name: 'Stop',
	stop_sequence: 1,
	trip_id: '[agency]trip-1',
	vehicle_id: 'vehicle-1',
};
const pattern = HubV1ApiPatternSchema.parse({
	_id: 'pattern-1',
	agency_id: 'agency',
	color: '#1677FF',
	direction_id: 0,
	headsign: 'Destination',
	line_id: 'line-1',
	path: [{ allow_drop_off: true, allow_pickup: true, distance: 0, distance_delta: 0, stop_id: 'stop-1', stop_sequence: 1 }],
	route_id: 'route-1',
	shape_extension: 0,
	shape_id: 'shape-1',
	shape_polyline: '_}`yhA~lljP_ibE~hbE',
	short_name: '1001',
	text_color: '#FFFFFF',
	trips: [{
		schedule: [{ arrival_time: '15:00:00', arrival_time_24h: '15:00:00', stop_id: 'stop-1', stop_sequence: 1 }],
		service_ids: ['service-1'],
		trip_ids: ['[agency]trip-1'],
		valid_on: [today, tomorrow, futureDate],
		version_id: 'trip-version-1',
	}],
	tts_headsign: 'Destination',
	valid_on: [today, tomorrow, futureDate],
	version_id: 'pattern-version-1',
});

describe('stop timetable live arrivals', () => {
	for (const selectedOperationalDate of [tomorrow, futureDate]) {
		it(`keeps scheduled arrivals on ${selectedOperationalDate} despite a matching live trip`, () => {
			const [arrival] = buildStopTimetable({ isTodaySelected: false, selectedOperationalDate, stopEtas: [liveEta], stopId: 'stop-1', validPatterns: [pattern] });

			assert.equal(arrival.arrival_estimated_ms, null);
			assert.equal(arrival.arrival_delay_ms, 0);
			assert.equal(arrival.arrival_effective_ms, arrival.arrival_scheduled_ms);
			assert.equal(arrival.is_realtime, false);
			assert.equal(arrival.is_past, false);
		});
	}

	it('continues applying matching live arrivals today', () => {
		const [arrival] = buildStopTimetable({ isTodaySelected: true, selectedOperationalDate: today, stopEtas: [liveEta], stopId: 'stop-1', validPatterns: [pattern] });

		assert.equal(arrival.arrival_estimated_ms, liveEta.eta_at);
		assert.equal(arrival.arrival_effective_ms, liveEta.eta_at);
		assert.equal(arrival.arrival_delay_ms, 120_000);
		assert.equal(arrival.is_realtime, true);
		assert.equal(arrival.is_past, true);
	});

	it('falls back to the schedule today when there is no live match', () => {
		const [arrival] = buildStopTimetable({ isTodaySelected: true, selectedOperationalDate: today, stopEtas: [{ ...liveEta, trip_id: 'another-trip' }], stopId: 'stop-1', validPatterns: [pattern] });

		assert.equal(arrival.arrival_estimated_ms, null);
		assert.equal(arrival.arrival_effective_ms, arrival.arrival_scheduled_ms);
		assert.equal(arrival.arrival_delay_ms, 0);
		assert.equal(arrival.is_realtime, false);
	});
});
