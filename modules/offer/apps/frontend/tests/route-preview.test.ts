import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
	buildRoutePreviewRecalculationPlan,
	composeRoutePreviewResponse,
	mergeRoutePreviewRange,
	type RoutePreviewLeg,
	type RoutePreviewPoint,
} from '../src/utils/route-preview';

/* * */

function createPoint(key: string, lat: number, lon: number): RoutePreviewPoint {
	return { key, lat, lon, type: 'break' };
}

function createLeg(index: number, distance = 100): RoutePreviewLeg {
	const geometry: [number, number][] = [
		[index, index],
		[index + 1, index + 1],
	];

	return {
		distance,
		duration: distance / 10,
		encoded_polyline: `leg-${index}`,
		from_index: index,
		geojson: {
			geometry: { coordinates: geometry, type: 'LineString' },
			properties: {
				distance,
				duration: distance / 10,
				from_index: index,
				to_index: index + 1,
			},
			type: 'Feature',
		},
		geometry,
		to_index: index + 1,
	};
}

/* * */

describe('route preview incremental recalculation', () => {
	test('moving an anchor recalculates only its two adjacent legs', () => {
		const previousPoints = [
			createPoint('stop:a', 1, 1),
			createPoint('anchor:x', 2, 2),
			createPoint('stop:b', 3, 3),
			createPoint('stop:c', 4, 4),
		];
		const nextPoints = [
			previousPoints[0],
			createPoint('anchor:x', 2.5, 2.5),
			previousPoints[2],
			previousPoints[3],
		];

		const plan = buildRoutePreviewRecalculationPlan(
			previousPoints,
			nextPoints,
			[createLeg(0), createLeg(1), createLeg(2)],
		);

		assert.deepEqual(plan.ranges, [{ from_index: 0, to_index: 2 }]);
		assert.equal(plan.legs[0], undefined);
		assert.equal(plan.legs[1], undefined);
		assert.equal(plan.legs[2]?.from_index, 2);
	});

	test('adding an anchor reuses legs outside the affected stop segment', () => {
		const stopA = createPoint('stop:a', 1, 1);
		const stopB = createPoint('stop:b', 2, 2);
		const stopC = createPoint('stop:c', 3, 3);
		const previousPoints = [stopA, stopB, stopC];
		const nextPoints = [stopA, createPoint('anchor:x', 1.5, 1.5), stopB, stopC];

		const plan = buildRoutePreviewRecalculationPlan(
			previousPoints,
			nextPoints,
			[createLeg(0), createLeg(1, 200)],
		);

		assert.deepEqual(plan.ranges, [{ from_index: 0, to_index: 2 }]);
		assert.equal(plan.legs[2]?.distance, 200);
		assert.equal(plan.legs[2]?.from_index, 2);

		mergeRoutePreviewRange(plan.legs, plan.ranges[0], [createLeg(0, 50), createLeg(1, 60)]);
		const response = composeRoutePreviewResponse(plan.legs);

		assert.equal(response.distance, 310);
		assert.equal(response.duration, 31);
		assert.equal(response.legs.length, 3);
		assert.deepEqual(response.legs.map(leg => [leg.from_index, leg.to_index]), [[0, 1], [1, 2], [2, 3]]);
	});

	test('missing previous legs produces one full-route range', () => {
		const points = [
			createPoint('stop:a', 1, 1),
			createPoint('stop:b', 2, 2),
			createPoint('stop:c', 3, 3),
		];

		const plan = buildRoutePreviewRecalculationPlan([], points, []);

		assert.deepEqual(plan.ranges, [{ from_index: 0, to_index: 2 }]);
		assert.deepEqual(plan.legs, [undefined, undefined]);
	});
});
