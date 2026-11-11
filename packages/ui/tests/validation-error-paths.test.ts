import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getFormErrorPaths } from '../src/form/standard-form/get-form-error-paths';

test('language refresh targets nested error leaves without traversing input references', () => {
	const ref: { current?: unknown } = {};
	ref.current = ref;
	assert.deepEqual(getFormErrorPaths({
		name: { message: 'Required', ref, type: 'invalid_type' },
		rows: [{ date: { message: 'Invalid date', ref, type: 'custom' } }],
	}), ['name', 'rows.0.date']);
	assert.deepEqual(getFormErrorPaths({}), []);
});
