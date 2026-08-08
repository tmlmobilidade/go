/* * */

import { buildDemandByPatternQueryInput } from '@/endpoints/metrics/controllers/get-demand-by-pattern.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { GetDemandByPatternQuerySchema } from '@tmlmobilidade/go-types-performance';
import { buildMetricDataNotFoundMessage } from '@tmlmobilidade/utils';
import assert from 'node:assert/strict';

/* * */

const parsedQuery = GetDemandByPatternQuerySchema.parse({
	end_date: '2026-08',
	pattern_id: '1201_0_1',
	pattern_ids: ['1202_0_1,1203_0_1', '1201_0_1'],
	start_date: '2025',
	time_grain: 'year',
});

assert.deepEqual(
	buildDemandByPatternQueryInput(parsedQuery),
	{
		end_date: 20260831,
		pattern_ids: ['1201_0_1', '1202_0_1', '1203_0_1'],
		start_date: 20250101,
		time_grain: 'year',
	},
);

assert.equal(GetDemandByPatternQuerySchema.safeParse({ time_grain: 'day' }).success, false);
assert.equal(GetDemandByPatternQuerySchema.safeParse({ pattern_id: '1201_0_1', time_grain: 'week' }).success, false);
assert.equal(
	buildMetricDataNotFoundMessage({
		entityIds: ['1201_0_1'],
		entityNames: { plural: 'patterns', singular: 'pattern' },
		metricName: 'passenger-demand',
	}),
	'Pattern not found or has no passenger-demand data: 1201_0_1',
);
assert.equal(
	buildMetricDataNotFoundMessage({
		entityIds: ['1201_0_1', '1202_0_1'],
		entityNames: { plural: 'patterns', singular: 'pattern' },
		metricName: 'passenger-demand',
	}),
	'Patterns not found or have no passenger-demand data: 1201_0_1, 1202_0_1',
);

assert.throws(
	() => buildDemandByPatternQueryInput({
		end_date: '2026-08-01',
		pattern_id: '1201_0_1',
		start_date: '2026-08-02',
		time_grain: 'day',
	}),
	(error: unknown) => error instanceof HttpException && error.statusCode === HTTP_STATUS.BAD_REQUEST,
);

console.log('Performance API demand-by-pattern tests passed.');
