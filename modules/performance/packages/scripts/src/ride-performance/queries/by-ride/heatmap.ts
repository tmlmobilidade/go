/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type RidePerformanceFilters, RidePerformanceFiltersSchema, type RidePerformanceHeatmapCell, RidePerformanceHeatmapCellSchema } from '@tmlmobilidade/go-types-performance';

import { RIDE_PERFORMANCE_TIMEZONE } from '../../definition.js';
import { buildRidePerformanceFilterContext, normalizeRidePerformanceMetrics, RIDE_PERFORMANCE_LOCAL_HOUR_EXPRESSION, RIDE_PERFORMANCE_QUANTITY_SELECTION, type RidePerformanceQuantityRow } from './query-support.js';

/* * */

interface HeatmapRow extends RidePerformanceQuantityRow {
	day_of_week: number | string
	hour: number | string
}

/* * */

export function buildRidePerformanceHeatmapQuery(input: RidePerformanceFilters) {
	const filters = RidePerformanceFiltersSchema.parse(input);
	const context = buildRidePerformanceFilterContext(filters);
	const dayExpression = `toDayOfWeek(fromUnixTimestamp64Milli(interval_start, '${RIDE_PERFORMANCE_TIMEZONE}'))`;

	return {
		params: context.params,
		query: `
			SELECT
				${dayExpression} AS day_of_week,
				${RIDE_PERFORMANCE_LOCAL_HOUR_EXPRESSION} AS hour,
				${RIDE_PERFORMANCE_QUANTITY_SELECTION}
			FROM performance.ride_service_by_ride
			WHERE ${context.conditions.join('\n\t\t\t\tAND ')}
			GROUP BY day_of_week, hour
			ORDER BY day_of_week, hour
		`,
	};
}

export async function queryRidePerformanceHeatmap(input: RidePerformanceFilters): Promise<RidePerformanceHeatmapCell[]> {
	const { params, query } = buildRidePerformanceHeatmapQuery(input);
	const rows = await labDb.performance.rideServiceByRide.queryFromString<HeatmapRow>(query, params);
	return RidePerformanceHeatmapCellSchema.array().parse(rows.map(row => ({
		...normalizeRidePerformanceMetrics(row),
		day_of_week: Number(row.day_of_week),
		hour: Number(row.hour),
	})));
}

/* * */
