import assert from 'node:assert/strict';
import test from 'node:test';
import { circle, destination, distance } from '@turf/turf';

import { isWithinStopsListCoordinatesRadius as within, parseStopsListCoordinates as parse } from '../src/components/stops/list/filters/StopsListFilterCoordinates/coordinates.ts';

test('valid coordinates preserve latitude/longitude order and precision', () => {
	assert.deepEqual(parse(' 38.722312345, -9.139312345 '), [-9.139312345, 38.722312345]);
	assert.deepEqual(parse('0, 0'), [0, 0]);
	assert.deepEqual(parse('-90, 180'), [180, -90]);
});

test('invalid and incomplete coordinates never activate', () => {
	const invalidValues = ['', ' ', '38', '38,', ', -9', '91, 0', '0, 181', 'NaN, 0', 'Infinity, 0', '38, -9, 1', '38x, -9', '0x10, 0', '38.7 -9.1'];
	for (const value of invalidValues) assert.equal(parse(value), null, value);
});

test('includes 100 m boundary and excludes points beyond in every direction', () => {
	for (const center of [[-9.1393, 38.7223], [179.9999, 0], [0, 89.99], [0, 0]]) {
		for (const bearing of [0, 45, 90, 180, 270]) {
			for (const meters of [0, 99.999, 100, 100.001, 101]) {
				const [longitude, latitude] = destination(center, meters, bearing, { units: 'meters' }).geometry.coordinates;
				assert.equal(within(center, { longitude, latitude }), meters <= 100, `${meters} m bearing ${bearing}`);
			}
		}
		for (const vertex of circle(center, 100, { steps: 128, units: 'meters' }).geometry.coordinates[0]) {
			assert.ok(Math.abs(distance(center, vertex, { units: 'meters' }) - 100) < 1e-5);
		}
	}
});

test('filters an existing result set and supports empty matches', () => {
	const center = [-9.1393, 38.7223];
	const stops = [{ id: 'near', longitude: center[0], latitude: center[1] }, { id: 'far', longitude: 0, latitude: 0 }];
	assert.deepEqual(stops.filter(stop => within(center, stop)).map(stop => stop.id), ['near']);
	assert.deepEqual(stops.filter(stop => within([90, 45], stop)), []);
	assert.equal(within(center, { longitude: NaN, latitude: 38 }), false);
});
