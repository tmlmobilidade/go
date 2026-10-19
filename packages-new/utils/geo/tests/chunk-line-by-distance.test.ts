import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getDistanceBetweenPositions } from '../src/measurements/distance-between-points.js';
import { chunkLineStringByDistance } from '../src/transformers/chunk-line-by-distance.js';

/* * */

// ~0.001 deg of longitude at 38.7 N is ~87 m; a 3-vertex bend near Lisbon.
const line = {
	coordinates: [
		[-9.1500, 38.7200],
		[-9.1400, 38.7200],
		[-9.1400, 38.7300],
	],
	type: 'LineString' as const,
};

function pathLength(coords: number[][]) {
	let total = 0;
	for (let i = 1; i < coords.length; i++) total += getDistanceBetweenPositions(coords[i - 1], coords[i]);
	return total;
}

describe('chunkLineStringByDistance', () => {
	it('emits only the first vertex, the equidistant nodes and the last vertex', () => {
		const segment = 25;
		const total = pathLength(line.coordinates);
		const out = chunkLineStringByDistance(line, segment);
		const expected = Math.floor(total / segment) + 1 + (total % segment > 0 ? 1 : 0);
		assert.equal(out.coordinates.length, expected);
		assert.deepEqual(out.coordinates[0], line.coordinates[0]);
		assert.deepEqual(out.coordinates.at(-1), line.coordinates.at(-1));
	});

	it('keeps a constant spacing along the path (no raw vertices interleaved)', () => {
		const segment = 25;
		const out = chunkLineStringByDistance(line, segment);
		let onGrid = 0;
		for (let i = 1; i < out.coordinates.length - 1; i++) {
			const d = getDistanceBetweenPositions(out.coordinates[i - 1], out.coordinates[i]);
			// The chord between two nodes is never longer than the path between them...
			assert.ok(d <= segment + 0.5, `node ${i}: spacing ${d.toFixed(3)} m exceeds ${segment} m`);
			// ...and equals it everywhere except across the single bend.
			if (Math.abs(d - segment) < 0.5) onGrid++;
		}
		assert.ok(onGrid >= out.coordinates.length - 4, `only ${onGrid} of ${out.coordinates.length} gaps are ${segment} m`);
		const last = getDistanceBetweenPositions(out.coordinates.at(-2)!, out.coordinates.at(-1)!);
		assert.ok(last > 0 && last <= segment + 0.5, `last node spacing ${last.toFixed(3)} m`);
	});

	it('preserves the total length of the input', () => {
		const out = chunkLineStringByDistance(line, 25);
		const inLen = pathLength(line.coordinates);
		const outLen = pathLength(out.coordinates);
		// Chords across the single bend shorten the path by less than one segment.
		assert.ok(Math.abs(inLen - outLen) < 25, `in ${inLen.toFixed(1)} m vs out ${outLen.toFixed(1)} m`);
	});

	it('does not mutate the input', () => {
		const copy = structuredClone(line);
		chunkLineStringByDistance(line, 25);
		assert.deepEqual(line, copy);
	});
});
