import { PatternsStopSearchQuerySchema } from '@tmlmobilidade/go-offer-pckg-types';
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { createPatternStopsSearchFilter, escapePatternStopsSearchQuery, PATTERN_STOPS_SEARCH_PROJECTION } from '../src/utils/pattern-stops-search.js';

/* * */

describe('pattern stops search', () => {
	test('requires at least two search characters', () => {
		assert.equal(PatternsStopSearchQuerySchema.safeParse({ query: '' }).success, false);
		assert.equal(PatternsStopSearchQuerySchema.safeParse({ query: 'a' }).success, false);
		assert.deepEqual(PatternsStopSearchQuerySchema.parse({ query: '  ab  ' }), { limit: 25, query: 'ab' });
	});

	test('caps the requested result count', () => {
		assert.equal(PatternsStopSearchQuerySchema.safeParse({ limit: 25, query: 'ab' }).success, true);
		assert.equal(PatternsStopSearchQuerySchema.safeParse({ limit: 26, query: 'ab' }).success, false);
	});

	test('escapes regular expression syntax', () => {
		assert.equal(escapePatternStopsSearchQuery('stop.*(1)'), 'stop\\.\\*\\(1\\)');

		const filter = createPatternStopsSearchFilter('stop.*(1)');
		const expressions = filter.$or?.map(condition => Object.values(condition)[0]);
		assert.equal(expressions?.every(expression => expression instanceof RegExp && expression.source === 'stop\\.\\*\\(1\\)'), true);
	});

	test('projects only selector fields', () => {
		assert.deepEqual(PATTERN_STOPS_SEARCH_PROJECTION, { _id: 1, name: 1 });
	});
});
