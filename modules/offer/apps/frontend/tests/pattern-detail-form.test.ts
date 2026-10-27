import { PatternsDetailFormSchema, PatternsDetailSchema } from '@tmlmobilidade/go-offer-pckg-types';
import { UpdatePatternSchema } from '@tmlmobilidade/go-types-offer';
import assert from 'node:assert/strict';
import test from 'node:test';

import { getPatternsDetailFormValues } from '../src/components/patterns/detail/patterns-detail-form-values.js';

/* * */

function createPattern() {
	return PatternsDetailSchema.parse({
		_id: 'pattern',
		code: 'P1',
		comments: [],
		created_at: 1792368000000,
		created_by: 'actor',
		destination: 'Destination',
		direction: 'outbound',
		headsign: 'Headsign',
		is_locked: true,
		line_id: 'line',
		origin: 'Origin',
		path: [{ _id: 'path', stop: null, stop_id: '100001' }],
		route_id: 'route',
		rules: [
			{ _id: 'manual', kind: 'manual', operating_mode: 'include', timepoints: ['08:00'], weekdays: [1], year_period_ids: [] },
			{ _id: 'derived', all_day: true, dates: ['20261027'], end_time: '', event: { id: 'event', title: 'Event' }, kind: 'event_restriction', lines_mode: 'all', start_time: '' },
		],
		updated_at: 1792368000000,
		updated_by: 'actor',
	});
}

/* * */

test('Pattern form separates writable manual rules from server-owned metadata and derived rules', () => {
	const values = getPatternsDetailFormValues(createPattern());
	assert.deepEqual(values.rules?.map(rule => rule._id), ['manual']);
	for (const key of ['_id', 'comments', 'created_at', 'created_by', 'is_locked', 'updated_at', 'updated_by']) {
		assert.equal(key in values, false);
	}
});

test('Populated stops remain in the frontend form and are excluded from the shared update request', () => {
	const values = PatternsDetailFormSchema.parse(getPatternsDetailFormValues(createPattern()));
	assert.equal(values.path?.[0].stop, null);
	const request = UpdatePatternSchema.parse(values);
	assert.ok(request.path?.[0]);
	assert.equal('stop' in request.path[0], false);
	assert.equal(request.path[0].stop_id, '100001');
});

test('Pattern form retains shared validation for invalid edited path and config fields', () => {
	const values = getPatternsDetailFormValues(createPattern());
	assert.equal(PatternsDetailFormSchema.safeParse({ ...values, code: '' }).success, false);
	assert.equal(PatternsDetailFormSchema.safeParse({ ...values, path: [{ ...values.path?.[0], stop_id: 'invalid' }] }).success, false);
});
