/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type RidePerformanceFilters, RidePerformanceFiltersSchema, type RidePerformanceMetrics } from '@tmlmobilidade/go-types-performance';

import { buildRidePerformanceFilterContext, normalizeRidePerformanceMetrics, RIDE_PERFORMANCE_QUANTITY_SELECTION, type RidePerformanceQuantityRow } from './query-support.js';

/* * */

export function buildRidePerformanceTotalQuery(input: RidePerformanceFilters) {
	const filters = RidePerformanceFiltersSchema.parse(input);
	const context = buildRidePerformanceFilterContext(filters);

	return {
		params: context.params,
		query: `
			SELECT ${RIDE_PERFORMANCE_QUANTITY_SELECTION}
			FROM performance.ride_service_by_ride
			WHERE ${context.conditions.join('\n\t\t\t\tAND ')}
		`,
	};
}

export async function queryRidePerformanceTotal(input: RidePerformanceFilters): Promise<RidePerformanceMetrics> {
	const { params, query } = buildRidePerformanceTotalQuery(input);
	const [row] = await labDb.performance.rideServiceByRide.queryFromString<RidePerformanceQuantityRow>(query, params);
	if (!row) throw new Error('Ride-performance total query returned no aggregate row.');
	return normalizeRidePerformanceMetrics(row);
}

/* * */
