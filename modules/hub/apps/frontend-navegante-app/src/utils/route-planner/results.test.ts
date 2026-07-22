import { type MotisItinerary, type MotisPlanLeg } from '@/types/route-planner';
import { getItineraryTransitModeFilters, itineraryMatchesEnabledModes, type RoutePlannerModeFilter, type RoutePlannerVisibleItinerary, sortVisibleItineraries, toggleRoutePlannerMode } from '@/utils/route-planner/results';
import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

/* * */

describe('route-planner result mode filtering', () => {
	it('excludes walking, removes duplicates, and normalizes unsupported modes to transit', () => {
		const itinerary = createItinerary('mixed', 1_200, 1, [
			createLeg('WALK', 300),
			createLeg('BUS', 300),
			createLeg('BUS', 300),
			createLeg('CAR', 300),
		]);

		assert.deepEqual(getItineraryTransitModeFilters(itinerary), ['bus', 'transit']);
	});

	it('requires every transit mode in a mixed itinerary to remain enabled', () => {
		const itinerary = createItinerary('mixed', 1_200, 1, [
			createLeg('BUS', 600),
			createLeg('FERRY', 600),
		]);

		assert.equal(itineraryMatchesEnabledModes(itinerary, enabledModes('bus')), false);
		assert.equal(itineraryMatchesEnabledModes(itinerary, enabledModes('bus', 'ferry')), true);
	});

	it('keeps walking-only itineraries visible regardless of enabled transit modes', () => {
		const itinerary = createItinerary('walking', 600, 0, [createLeg('WALK', 600)]);

		assert.equal(itineraryMatchesEnabledModes(itinerary, new Set()), true);
	});

	it('keeps at least one transport mode enabled', () => {
		const enabled = enabledModes('bus');

		assert.equal(toggleRoutePlannerMode(enabled, 'bus'), enabled);
		assert.deepEqual(toggleRoutePlannerMode(enabledModes('bus', 'ferry'), 'bus'), enabledModes('ferry'));
		assert.deepEqual(toggleRoutePlannerMode(enabled, 'ferry'), enabledModes('bus', 'ferry'));
	});
});

describe('route-planner result sorting', () => {
	const itineraries: RoutePlannerVisibleItinerary[] = [
		{ index: 7, itinerary: createItinerary('a', 1_200, 1, [createLeg('WALK', 300), createLeg('BUS', 900)]) },
		{ index: 3, itinerary: createItinerary('b', 900, 2, [createLeg('WALK', 60), createLeg('BUS', 840)]) },
		{ index: 9, itinerary: createItinerary('c', 1_500, 0, [createLeg('WALK', 180), createLeg('BUS', 1_320)]) },
	];

	it('preserves API order and original indexes for the best sort', () => {
		const sorted = sortVisibleItineraries(itineraries, 'best');

		assert.deepEqual(sorted.map(result => result.index), [7, 3, 9]);
		assert.notEqual(sorted, itineraries);
		assert.deepEqual(itineraries.map(result => result.index), [7, 3, 9]);
	});

	it('sorts fastest by total itinerary duration', () => {
		const sorted = sortVisibleItineraries(itineraries, 'fastest');

		assert.deepEqual(sorted.map(result => result.itinerary.id), ['b', 'a', 'c']);
	});

	it('sorts fewer transfers by the itinerary transfer count', () => {
		const sorted = sortVisibleItineraries(itineraries, 'fewer_transfers');

		assert.deepEqual(sorted.map(result => result.itinerary.id), ['c', 'a', 'b']);
	});

	it('sorts least walking by the sum of walking-leg durations', () => {
		const sorted = sortVisibleItineraries(itineraries, 'least_walking');

		assert.deepEqual(sorted.map(result => result.itinerary.id), ['b', 'c', 'a']);
	});
});

/* * */

function createItinerary(id: string, duration: number, transfers: number, legs: MotisPlanLeg[]): MotisItinerary {
	return {
		duration,
		endTime: '2026-07-22T10:00:00.000Z',
		id,
		legs,
		startTime: '2026-07-22T09:00:00.000Z',
		transfers,
	};
}

function createLeg(mode: MotisPlanLeg['mode'], duration: number): MotisPlanLeg {
	return {
		duration,
		endTime: '2026-07-22T10:00:00.000Z',
		from: { lat: 38.72, lon: -9.14, name: 'Origem' },
		legGeometry: { length: 0, points: '', precision: 5 },
		mode,
		realTime: false,
		scheduled: true,
		scheduledEndTime: '2026-07-22T10:00:00.000Z',
		scheduledStartTime: '2026-07-22T09:00:00.000Z',
		startTime: '2026-07-22T09:00:00.000Z',
		to: { lat: 38.73, lon: -9.13, name: 'Destino' },
	};
}

function enabledModes(...modes: RoutePlannerModeFilter[]) {
	return new Set(modes);
}
