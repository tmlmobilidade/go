import { buildPatternShapeFeature } from '@/utils/map/pattern-shape';
import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

/* * */

describe('pattern shape map data', () => {
	it('decodes Hub E6 polylines and applies pattern colors', () => {
		const feature = buildPatternShapeFeature({
			color: '#C61D23',
			shape_polyline: '_}`yhA~lljP_ibE~hbE',
			text_color: '#FFFFFF',
		});

		assert.deepEqual(feature, {
			geometry: {
				coordinates: [[-9.1, 38.7], [-9.2, 38.8]],
				type: 'LineString',
			},
			properties: {
				color: '#C61D23',
				text_color: '#FFFFFF',
			},
			type: 'Feature',
		});
	});

	it('returns no map feature when the pattern has no usable polyline', () => {
		assert.equal(buildPatternShapeFeature({ color: '#C61D23', text_color: '#FFFFFF' }), null);
		assert.equal(buildPatternShapeFeature({ color: '#C61D23', shape_polyline: '?', text_color: '#FFFFFF' }), null);
	});
});
