import { encodePolylineFromGeoJson } from '@tmlmobilidade/geo';
import assert from 'node:assert/strict';
import { afterEach, describe, test } from 'node:test';

import { routeWithValhalla, splitRoutePreviewPoints } from '../src/utils/route-preview.js';

/* * */

const originalFetch = globalThis.fetch;

afterEach(() => {
	globalThis.fetch = originalFetch;
});

/* * */

describe('Valhalla route previews', () => {
	test('routes every point in one request and preserves one leg per pair', async () => {
		const requestBodies: unknown[] = [];
		const encodedShape = encodePolylineFromGeoJson({
			coordinates: [[-9.1, 38.7], [-9.2, 38.8]],
			type: 'LineString',
		}, 6);

		globalThis.fetch = async (_input, init) => {
			requestBodies.push(JSON.parse(String(init?.body)));

			return new Response(JSON.stringify({
				trip: {
					legs: Array.from({ length: 3 }, (_, index) => ({
						shape: encodedShape,
						summary: { length: index + 1, time: (index + 1) * 10 },
					})),
					summary: { length: 6, time: 60 },
				},
			}), { status: 200 });
		};

		const response = await routeWithValhalla([
			{ lat: 38.70, lon: -9.10, type: 'break' },
			{ lat: 38.71, lon: -9.11, type: 'through' },
			{ lat: 38.72, lon: -9.12, type: 'via' },
			{ lat: 38.73, lon: -9.13, type: 'break' },
		], { costing: 'bus', url: 'https://valhalla.test' });

		assert.equal(requestBodies.length, 1);
		assert.deepEqual(requestBodies[0], {
			costing: 'bus',
			directions_options: { narrative: false, units: 'kilometers' },
			locations: [
				{ lat: 38.70, lon: -9.10, type: 'break' },
				{ lat: 38.71, lon: -9.11, type: 'break_through' },
				{ lat: 38.72, lon: -9.12, type: 'break' },
				{ lat: 38.73, lon: -9.13, type: 'break' },
			],
		});
		assert.equal(response.legs.length, 3);
		assert.deepEqual(response.legs.map(leg => [leg.from_index, leg.to_index]), [[0, 1], [1, 2], [2, 3]]);
		assert.equal(response.distance, 6000);
		assert.equal(response.duration, 60);
	});

	test('splits routes at the Valhalla location limit with one overlapping point', () => {
		const points = Array.from({ length: 51 }, (_, index) => ({
			lat: 38 + index / 100,
			lon: -9,
			type: 'break' as const,
		}));

		const chunks = splitRoutePreviewPoints(points, 50);

		assert.deepEqual(chunks.map(chunk => ({
			from_index: chunk.from_index,
			length: chunk.points.length,
		})), [
			{ from_index: 0, length: 50 },
			{ from_index: 49, length: 2 },
		]);
		assert.equal(chunks[0].points.at(-1), chunks[1].points[0]);
	});

	test('does not fall back to per-leg requests after cancellation', async () => {
		let requestCount = 0;
		const abortController = new AbortController();
		abortController.abort();

		globalThis.fetch = async (_input, init) => {
			requestCount++;
			assert.equal(init?.signal?.aborted, true);
			throw new DOMException('This operation was aborted', 'AbortError');
		};

		await assert.rejects(routeWithValhalla([
			{ lat: 38.70, lon: -9.10, type: 'break' },
			{ lat: 38.71, lon: -9.11, type: 'via' },
			{ lat: 38.72, lon: -9.12, type: 'break' },
		], {
			costing: 'bus',
			signal: abortController.signal,
			url: 'https://valhalla.test',
		}), { name: 'AbortError' });

		assert.equal(requestCount, 1);
	});
});
