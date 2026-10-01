import { preparePositionalQueryParams } from '@tmlmobilidade/go-clients-clickhouse';
import { OperationRidesV2ExtractionPropertiesSchema } from '@tmlmobilidade/go-types-extractions';
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { getSqlAndParams } from '../src/versions/v2/apply-query.js';

/* * */

const baseProperties = OperationRidesV2ExtractionPropertiesSchema.parse({
	agency_ids: ['41'],
	start_time_scheduled_end: 1757980800000,
	start_time_scheduled_start: 1757894400000,
});

/* * */

describe('operation rides v2 apply query', () => {
	test('applies only the filters that were given', () => {
		const query = getSqlAndParams(baseProperties);

		assert.ok(query);
		assert.match(query.sql, /agency_id IN \(\$3\)/);
		assert.equal(query.sql.includes('hasAny'), false);
		assert.equal(query.sql.includes('operational_status IN ($'), false);
		assert.equal(query.sql.includes('ILIKE'), false);
		assert.deepEqual(Object.keys(query.params), ['1', '2', '3']);
	});

	test('expands none into a NULL branch', () => {
		const query = getSqlAndParams({ ...baseProperties, start_delay_statuses: ['delayed', 'none'] });

		assert.ok(query);
		assert.equal(query.sql.includes('start_delay_status IN ($4)'), true);
		assert.equal(query.sql.includes('start_delay_status IS NULL'), true);
		assert.equal(query.params[4], 'delayed');
	});

	test('keeps a lone none as a NULL only condition', () => {
		const query = getSqlAndParams({ ...baseProperties, analysis_transaction_sequentiality_grades: ['none'] });

		assert.ok(query);
		assert.equal(query.sql.includes('(analysis_transaction_sequentiality_grade IS NULL)'), true);
		assert.deepEqual(Object.keys(query.params), ['1', '2', '3']);
	});

	test('does not query when a selection is empty', () => {
		assert.equal(getSqlAndParams({ ...baseProperties, agency_ids: [] }), null);
		assert.equal(getSqlAndParams({ ...baseProperties, operational_statuses: [] }), null);
		assert.equal(getSqlAndParams({ ...baseProperties, analysis_simple_three_vehicle_events_grades: [] }), null);
	});

	test('ignores a blank search term', () => {
		const query = getSqlAndParams({ ...baseProperties, search: '   ' });

		assert.ok(query);
		assert.equal(query.sql.includes('ILIKE'), false);
	});

	test('numbers every param so the query can be prepared', () => {
		const query = getSqlAndParams({
			...baseProperties,
			agency_ids: ['41', '42'],
			analysis_at_least_one_vehicle_event_on_last_stop_grades: ['pass', 'none'],
			analysis_expected_apex_validation_interval_grades: ['fail'],
			analysis_simple_three_vehicle_events_grades: ['pass'],
			analysis_transaction_sequentiality_grades: ['error'],
			driver_ids: ['d1'],
			end_delay_statuses: ['early'],
			operational_statuses: ['ended', 'missed'],
			search: 'foo',
			start_delay_statuses: ['delayed'],
			vehicle_ids: ['v1', 'v2'],
		});

		assert.ok(query);

		// Throws on a placeholder without a param, and on a param without a placeholder.
		const preparedQuery = preparePositionalQueryParams(query.sql, query.params);

		assert.equal(/\$\d+/.test(preparedQuery.query), false);
		assert.equal(preparedQuery.query_params.p1, baseProperties.start_time_scheduled_start);
		assert.equal(preparedQuery.query_params.p3, '41');
	});
});
