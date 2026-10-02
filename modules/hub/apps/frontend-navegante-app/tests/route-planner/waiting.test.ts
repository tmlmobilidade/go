import { isSameRoutePlannerPlace } from '@/utils/route-planner/itinerary/places';
import { getItineraryWaitingMinutes, getRoutePlannerWaitingSteps } from '@/utils/route-planner/itinerary/waiting';
import { type MotisItinerary, type MotisPlanLeg } from '@tmlmobilidade/go-types-motis';
import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

/* * */

describe('itinerary waiting', () => {
	it('includes waiting after walking and during transfers without changing the legs', () => {
		const itinerary = createItinerary([
			createLeg('WALK', '09:00', '09:05'),
			createLeg('BUS', '09:08', '09:18'),
			createLeg('RAIL', '09:22', '09:29'),
		]);
		const steps = getRoutePlannerWaitingSteps(itinerary);
		assert.deepEqual(steps.map(step => [step.before_leg_index, step.duration_seconds]), [[1, 180], [2, 240]]);
		assert.equal(steps[0].from_time.effective_time, itinerary.legs[0].endTime);
		assert.equal(steps[0].to_time.effective_time, itinerary.legs[1].startTime);
		assert.equal(getItineraryWaitingMinutes(itinerary), 7);
		assert.deepEqual(itinerary.legs.map(leg => leg.mode), ['WALK', 'BUS', 'RAIL']);
	});

	it('preserves MOTIS walking times and counts only the gap before boarding', () => {
		const itinerary = createItinerary([
			createLeg('BUS', '09:00', '09:10'),
			createLeg('WALK', '09:13', '09:15'),
			createLeg('BUS', '09:17', '09:30'),
		]);
		const original = structuredClone(itinerary);
		const [waiting] = getRoutePlannerWaitingSteps(itinerary);
		assert.equal(waiting.before_leg_index, 2);
		assert.equal(waiting.duration_seconds, 120);
		assert.equal(waiting.from_time.effective_time, timestamp('09:15'));
		assert.equal(waiting.to_time.effective_time, timestamp('09:17'));
		assert.equal(getItineraryWaitingMinutes(itinerary), 2);
		assert.deepEqual(itinerary, original);
	});

	it('does not call gaps before walking legs waiting', () => {
		const itinerary = createItinerary([
			{ ...createLeg('BUS', '09:00', '09:08'), realTime: true, scheduledEndTime: timestamp('09:10') },
			createLeg('WALK', '09:13', '09:15'),
			createLeg('WALK', '09:16', '09:19'),
		]);
		assert.deepEqual(getRoutePlannerWaitingSteps(itinerary), []);
		assert.equal(getItineraryWaitingMinutes(itinerary), 0);
	});

	it('avoids hiding distinct stops with the same name', () => {
		const itinerary = createItinerary([createLeg('WALK', '09:00', '09:05'), createLeg('BUS', '09:08', '09:18')]);
		const place = itinerary.legs[0].to;
		assert.equal(isSameRoutePlannerPlace(place, { ...place, name: ' destino ' }), true);
		assert.equal(isSameRoutePlannerPlace({ ...place, stopId: 'A' }, { ...place, stopId: 'B' }), false);
		assert.equal(isSameRoutePlannerPlace(place, undefined), false);
	});

	it('excludes time before the itinerary and after arrival', () => {
		const itinerary = createItinerary([createLeg('BUS', '09:10', '09:20')]);
		itinerary.startTime = timestamp('08:00');
		itinerary.endTime = timestamp('10:00');
		assert.deepEqual(getRoutePlannerWaitingSteps(itinerary), []);
		assert.equal(getItineraryWaitingMinutes(itinerary), 0);
	});

	it('does not invent waits for empty, walking-only, contiguous, or overlapping legs', () => {
		for (const legs of [
			[],
			[createLeg('WALK', '09:00', '09:10')],
			[createLeg('WALK', '09:00', '09:10'), createLeg('BUS', '09:10', '09:20')],
			[createLeg('BUS', '09:00', '09:15'), createLeg('BUS', '09:10', '09:20')],
		]) {
			assert.equal(getItineraryWaitingMinutes(createItinerary(legs)), 0);
			assert.deepEqual(getRoutePlannerWaitingSteps(createItinerary(legs)), []);
		}
	});

	it('uses realtime arrival and departure rather than scheduled gaps', () => {
		const arriving = { ...createLeg('BUS', '09:00', '09:13'), realTime: true, scheduledEndTime: timestamp('09:10') };
		const departing = { ...createLeg('RAIL', '09:18', '09:30'), realTime: true, scheduledStartTime: timestamp('09:20') };
		const itinerary = createItinerary([arriving, departing]);
		assert.equal(getItineraryWaitingMinutes(itinerary), 5);
		const [step] = getRoutePlannerWaitingSteps(itinerary);
		assert.equal(step.from_time.planned_time, timestamp('09:10'));
		assert.equal(step.to_time.planned_time, timestamp('09:20'));
		assert.equal(step.to_time.is_realtime, true);
	});

	it('handles midnight crossings', () => {
		const itinerary = createItinerary([
			createLeg('BUS', '23:40', '23:58'),
			{ ...createLeg('RAIL', '00:03', '00:20'), startTime: '2026-09-30T00:03:00Z', endTime: '2026-09-30T00:20:00Z' },
		]);
		assert.equal(getItineraryWaitingMinutes(itinerary), 5);
	});

	it('ignores invalid timestamps and rounds total seconds once', () => {
		const invalid = { ...createLeg('BUS', '09:00', '09:05'), endTime: 'invalid' };
		assert.equal(getItineraryWaitingMinutes(createItinerary([invalid, createLeg('BUS', '09:08', '09:20')])), 0);
		const itinerary = createItinerary([
			createLeg('WALK', '09:00', '09:05'),
			{ ...createLeg('BUS', '09:05', '09:10'), startTime: timestamp('09:05:20') },
			{ ...createLeg('RAIL', '09:10', '09:15'), startTime: timestamp('09:10:20') },
		]);
		assert.equal(getItineraryWaitingMinutes(itinerary), 1);
		assert.equal(getRoutePlannerWaitingSteps(itinerary).length, 2);
	});
});

/* * */

function timestamp(time: string) {
	return `2026-09-29T${time.length === 5 ? `${time}:00` : time}Z`;
}

function createItinerary(legs: MotisPlanLeg[]): MotisItinerary {
	return { duration: 1_800, id: 'waiting-test', endTime: legs.at(-1)?.endTime ?? timestamp('09:30'), legs, startTime: legs[0]?.startTime ?? timestamp('09:00'), transfers: 1 };
}

function createLeg(mode: MotisPlanLeg['mode'], start: string, end: string): MotisPlanLeg {
	return {
		duration: (Date.parse(timestamp(end)) - Date.parse(timestamp(start))) / 1_000,
		endTime: timestamp(end),
		from: { lat: 38.72, lon: -9.14, name: 'Origem' },
		legGeometry: { length: 0, points: '', precision: 5 },
		mode,
		realTime: false,
		scheduled: true,
		scheduledEndTime: timestamp(end),
		scheduledStartTime: timestamp(start),
		startTime: timestamp(start),
		to: { lat: 38.73, lon: -9.13, name: 'Destino' },
	};
}
