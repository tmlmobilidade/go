import { createTimetable } from '@/utils/transit/create-timetable';
import { HubV1ApiPatternSchema } from '@tmlmobilidade/go-types-hub';
import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

/* * */

const date = OperationalDateIntSchema.parse(20261012);

function makePattern(id: string, tripIds: string[]) {
	return HubV1ApiPatternSchema.parse({
		_id: id,
		agency_id: 'agency',
		color: '#1677FF',
		direction_id: 0,
		headsign: 'Destination',
		line_id: 'line-1',
		path: [
			{ allow_drop_off: true, allow_pickup: true, distance: 0, distance_delta: 0, stop_id: 'stop-1', stop_sequence: 1 },
			{ allow_drop_off: true, allow_pickup: true, distance: 100, distance_delta: 100, stop_id: 'stop-2', stop_sequence: 2 },
		],
		route_id: 'route-1',
		shape_extension: 0,
		shape_id: 'shape-1',
		shape_polyline: '_}`yhA~lljP_ibE~hbE',
		short_name: '1001',
		text_color: '#FFFFFF',
		trips: tripIds.map(tripId => ({
			schedule: [{ arrival_time: '09:30:00', arrival_time_24h: '09:30:00', stop_id: 'stop-1', stop_sequence: 1 }],
			service_ids: ['service-1'],
			trip_ids: [tripId],
			valid_on: [date],
			version_id: tripId,
		})),
		tts_headsign: 'Destination',
		valid_on: [date],
		version_id: `${id}-version`,
	});
}

describe('line timetable coincident departures', () => {
	it('merges primary departures and retains every trip for highlighting without mutating input', () => {
		const primary = makePattern('primary', ['trip-1', 'trip-2', 'trip-1']);
		const before = structuredClone(primary);
		const timetable = createTimetable(primary, [], [], 'stop-1', 1, date);

		assert.deepEqual(timetable.hours[0].minutes, [{ exception_ids: [], minute_label: '30', minute_value: 30, trip_ids: ['trip-1', 'trip-2'] }]);
		assert.deepEqual(primary, before);
	});

	it('keeps simultaneous variants distinct and merges repeated trips within each variant', () => {
		const primary = makePattern('primary', ['primary-trip']);
		const variants = [makePattern('variant-a', ['a-1', 'a-2', 'a-1']), makePattern('variant-b', ['b-1', 'b-2'])];
		const before = structuredClone(variants);
		const timetable = createTimetable(primary, variants, [], 'stop-1', 1, date);

		assert.deepEqual(timetable.hours[0].minutes, [
			{ exception_ids: [], minute_label: '30', minute_value: 30, trip_ids: ['primary-trip'] },
			{ exception_ids: ['a'], minute_label: '30', minute_value: 30, trip_ids: ['a-1', 'a-2'] },
			{ exception_ids: ['b'], minute_label: '30', minute_value: 30, trip_ids: ['b-1', 'b-2'] },
		]);
		assert.equal(timetable.exceptions.length, 2);
		assert.deepEqual(variants, before);
	});
});
