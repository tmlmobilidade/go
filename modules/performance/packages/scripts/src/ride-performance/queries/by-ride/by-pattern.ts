/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type RidePerformanceBreakdownQueryInput, RidePerformanceBreakdownQueryInputSchema, type RidePerformanceByPatternItem, RidePerformanceByPatternItemSchema } from '@tmlmobilidade/go-types-performance';

import { buildRidePerformanceFilterContext, normalizeRidePerformanceMetrics, RIDE_PERFORMANCE_QUANTITY_SELECTION, type RidePerformanceQuantityRow } from './query-support.js';

/* * */

interface ByPatternRow extends RidePerformanceQuantityRow {
	pattern_id: string
}

/* * */

export function buildRidePerformanceByPatternQuery(input: RidePerformanceBreakdownQueryInput) {
	const filters = RidePerformanceBreakdownQueryInputSchema.parse(input);
	const context = buildRidePerformanceFilterContext(filters);

	return {
		params: context.params,
		query: `
			SELECT
				pattern_id,
				${RIDE_PERFORMANCE_QUANTITY_SELECTION}
			FROM performance.ride_service_by_ride
			WHERE ${context.conditions.join('\n\t\t\t\tAND ')}
			GROUP BY pattern_id
			ORDER BY scheduled_rides_qty DESC, pattern_id
			LIMIT ${filters.limit ?? 100}
		`,
	};
}

export async function queryRidePerformanceByPattern(input: RidePerformanceBreakdownQueryInput): Promise<RidePerformanceByPatternItem[]> {
	const { params, query } = buildRidePerformanceByPatternQuery(input);
	const rows = await labDb.performance.rideServiceByRide.queryFromString<ByPatternRow>(query, params);
	return RidePerformanceByPatternItemSchema.array().parse(rows.map(row => ({
		...normalizeRidePerformanceMetrics(row),
		pattern_id: row.pattern_id,
	})));
}

/* * */
