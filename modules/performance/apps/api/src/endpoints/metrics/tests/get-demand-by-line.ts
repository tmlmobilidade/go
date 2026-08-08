/* * */

import { buildDemandByLineQueryInput } from '@/endpoints/metrics/controllers/get-demand-by-line.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { GetDemandByLineQuerySchema } from '@tmlmobilidade/go-types-performance';
import { buildMetricDataNotFoundMessage } from '@tmlmobilidade/utils';
import assert from 'node:assert/strict';

/* * */

const parsedQuery = GetDemandByLineQuerySchema.parse({
	end_date: '2026-08',
	line_id: '1201',
	line_ids: ['1202,1203', '1201'],
	start_date: '2025',
	time_grain: 'month',
});

assert.deepEqual(
	buildDemandByLineQueryInput(parsedQuery),
	{
		end_date: 20260831,
		line_ids: ['1201', '1202', '1203'],
		start_date: 20250101,
		time_grain: 'month',
	},
);

assert.equal(GetDemandByLineQuerySchema.safeParse({ time_grain: 'day' }).success, false);
assert.equal(GetDemandByLineQuerySchema.safeParse({ line_id: '1201', time_grain: 'week' }).success, false);
assert.equal(
	buildMetricDataNotFoundMessage({
		entityIds: ['1201', '1202'],
		entityNames: { plural: 'lines', singular: 'line' },
		metricName: 'passenger-demand',
	}),
	'Lines not found or have no passenger-demand data: 1201, 1202',
);

assert.throws(
	() => buildDemandByLineQueryInput({
		end_date: '2026-08-01',
		line_id: '1201',
		start_date: '2026-08-02',
		time_grain: 'day',
	}),
	(error: unknown) => error instanceof HttpException && error.statusCode === HTTP_STATUS.BAD_REQUEST,
);

console.log('Performance API demand-by-line tests passed.');
