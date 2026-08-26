/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type RidePerformanceOverTimePoint, RidePerformanceOverTimePointSchema, type RidePerformanceOverTimeQueryInput, RidePerformanceOverTimeQueryInputSchema } from '@tmlmobilidade/go-types-performance';

import { buildRidePerformanceFilterContext, normalizeRidePerformanceMetrics, RIDE_PERFORMANCE_QUANTITY_SELECTION, type RidePerformanceQuantityRow } from './query-support.js';

/* * */

interface OverTimeRow extends RidePerformanceQuantityRow {
	period: number | string
}

/* * */

export function buildRidePerformanceOverTimeQuery(input: RidePerformanceOverTimeQueryInput) {
	const filters = RidePerformanceOverTimeQueryInputSchema.parse(input);
	const context = buildRidePerformanceFilterContext(filters);
	const periodExpression = filters.time_grain === 'day' ? 'operational_date' : 'interval_start';

	return {
		params: context.params,
		query: `
			SELECT
				${periodExpression} AS period,
				${RIDE_PERFORMANCE_QUANTITY_SELECTION}
			FROM performance.ride_service_by_ride
			WHERE ${context.conditions.join('\n\t\t\t\tAND ')}
			GROUP BY period
			ORDER BY period
		`,
	};
}

export async function queryRidePerformanceOverTime(input: RidePerformanceOverTimeQueryInput): Promise<RidePerformanceOverTimePoint[]> {
	const { params, query } = buildRidePerformanceOverTimeQuery(input);
	const rows = await labDb.performance.rideServiceByRide.queryFromString<OverTimeRow>(query, params);
	return RidePerformanceOverTimePointSchema.array().parse(rows.map(row => ({
		...normalizeRidePerformanceMetrics(row),
		period: Number(row.period),
	})));
}

/* * */
