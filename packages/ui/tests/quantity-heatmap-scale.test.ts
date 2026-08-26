/* * */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createQuantityHeatmapScale } from '../src/components/display/Heatmap/quantity-scale';

/* * */

test('spreads quantity values across the full intensity scale', () => {
	const scale = createQuantityHeatmapScale([100, 200, 300, 400, 500]);

	assert.equal(scale.getTone(100), 'intensity-1');
	assert.equal(scale.getTone(300), 'intensity-3');
	assert.equal(scale.getTone(500), 'intensity-5');
	assert.deepEqual(scale.legend.map(item => item.label), ['< 180', '180–260', '260–340', '340–420', '≥ 420']);
});

test('rounds calculated thresholds at a scale appropriate to the data', () => {
	const scale = createQuantityHeatmapScale([260, 742, 1_224, 1_707, 2_189, 2_671]);

	assert.deepEqual(scale.legend.map(item => item.label), ['< 700', '700–1200', '1200–1700', '1700–2200', '≥ 2200']);
	assert.equal(scale.getTone(699), 'intensity-1');
	assert.equal(scale.getTone(700), 'intensity-2');
	assert.equal(scale.getTone(2_200), 'intensity-5');
});

test('recalculates quantity thresholds when the supplied data changes', () => {
	const initialScale = createQuantityHeatmapScale([100, 200, 300, 400, 500]);
	const recalculatedScale = createQuantityHeatmapScale([1_000, 2_000, 3_000, 4_000, 5_000]);

	assert.equal(recalculatedScale.getTone(1_000), 'intensity-1');
	assert.equal(recalculatedScale.getTone(5_000), 'intensity-5');
	assert.notDeepEqual(recalculatedScale.legend, initialScale.legend);
});
