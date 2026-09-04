/* * */

import { buildPlannedSupplyBreakdownQueryInput, buildPlannedSupplyQueryInput } from '@/endpoints/planned-supply/query-params.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import assert from 'node:assert/strict';
import test from 'node:test';

/* * */

const query = {
	agency_id: '41',
	end_date: '2026-08-31',
	line_id: '4701',
	start_date: '2026-08-01',
};

test('parses a planned-supply period query', () => {
	assert.deepEqual(buildPlannedSupplyQueryInput(query), {
		agency_id: '41',
		end_date: 20260831,
		line_id: '4701',
		start_date: 20260801,
	});
	assert.deepEqual(buildPlannedSupplyBreakdownQueryInput({ ...query, dimension: 'pattern' }), {
		agency_id: '41',
		dimension: 'pattern',
		end_date: 20260831,
		line_id: '4701',
		start_date: 20260801,
	});
});

test('rejects incomplete and unsupported planned-supply queries', () => {
	const isBadRequest = (error: unknown) => error instanceof HttpException && error.statusCode === HTTP_STATUS.BAD_REQUEST;
	assert.throws(() => buildPlannedSupplyQueryInput({ ...query, line_id: undefined }), isBadRequest);
	assert.throws(() => buildPlannedSupplyBreakdownQueryInput({ ...query, dimension: 'operator' }), isBadRequest);
});

/* * */
