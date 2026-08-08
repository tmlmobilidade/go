/* * */

import { buildDemandByAgencyQueryInput } from '@/endpoints/metrics/controllers/get-demand-by-agency.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { GetDemandByAgencyQuerySchema } from '@tmlmobilidade/go-types-performance';
import { buildMetricDataNotFoundMessage } from '@tmlmobilidade/utils';
import assert from 'node:assert/strict';

/* * */

const parsedQuery = GetDemandByAgencyQuerySchema.parse({
	agency_id: '41',
	agency_ids: ['42,43', '41'],
	end_date: '2026-08',
	start_date: '2025',
	time_grain: 'month',
});

assert.deepEqual(
	buildDemandByAgencyQueryInput(parsedQuery),
	{
		agency_ids: ['41', '42', '43'],
		end_date: 20260831,
		start_date: 20250101,
		time_grain: 'month',
	},
);

assert.equal(GetDemandByAgencyQuerySchema.safeParse({}).success, false);
assert.equal(GetDemandByAgencyQuerySchema.safeParse({ time_grain: 'week' }).success, false);
assert.equal(
	buildMetricDataNotFoundMessage({
		entityIds: [],
		entityNames: { plural: 'agencies', singular: 'agency' },
		metricName: 'passenger-demand',
	}),
	'No passenger-demand data found',
);
assert.equal(
	buildMetricDataNotFoundMessage({
		entityIds: ['41'],
		entityNames: { plural: 'agencies', singular: 'agency' },
		metricName: 'passenger-demand',
	}),
	'Agency not found or has no passenger-demand data: 41',
);

assert.throws(
	() => buildDemandByAgencyQueryInput({
		end_date: '2026-08-01',
		start_date: '2026-08-02',
		time_grain: 'month',
	}),
	(error: unknown) => error instanceof HttpException && error.statusCode === HTTP_STATUS.BAD_REQUEST,
);

console.log('Performance API demand-by-agency tests passed.');
