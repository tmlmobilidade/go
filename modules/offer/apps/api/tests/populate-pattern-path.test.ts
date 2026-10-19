import { StopSchema } from '@tmlmobilidade/go-types-infrastructure';
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { populatePatternPath } from '../src/utils/populate-pattern-path.js';

/* * */

const locationItem = { admin_level: '8', name: 'Montijo', osm_id: 123 };
const stop = StopSchema.parse({
	_id: '310075',
	created_at: 1776176791213,
	created_by: 'system',
	latitude: 38.7,
	location: { country: locationItem, primary: locationItem, secondary: locationItem, tertiary: locationItem },
	longitude: -9,
	name: 'Estrada do Brejo Comprido',
	short_name: 'Brejo Comprido',
	updated_at: 1782310579345,
});

/* * */

describe('pattern path stop population', () => {
	test('loads numeric stored IDs as strings and attaches complete stop information', async () => {
		const path = [{ _id: 'first', distance_delta: 0, stop_id: 310075 }];
		const populated = await populatePatternPath(path, async (ids) => {
			assert.deepEqual(ids, ['310075']);
			return [stop];
		});

		assert.deepEqual(populated, [{ ...path[0], stop }]);
		assert.deepEqual(path, [{ _id: 'first', distance_delta: 0, stop_id: 310075 }]);
	});

	test('deduplicates mixed numeric and string IDs without losing repeated path entries', async () => {
		const path = [{ _id: 'first', stop_id: 310075 }, { _id: 'second', stop_id: '310075' }];
		const populated = await populatePatternPath(path, async (ids) => {
			assert.deepEqual(ids, ['310075']);
			return [stop];
		});

		assert.deepEqual(populated, path.map(item => ({ ...item, stop })));
	});

	test('preserves unmatched stops and path order', async () => {
		const path = [{ stop_id: '100166' }, { stop_id: '310075' }];
		const populated = await populatePatternPath(path, async () => [stop]);

		assert.deepEqual(populated, [{ stop: null, stop_id: '100166' }, { stop, stop_id: '310075' }]);
	});
});
