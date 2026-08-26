/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type RidePerformanceByLineItem, RidePerformanceByLineItemSchema, type RidePerformanceComparisonQueryInput, RidePerformanceComparisonQueryInputSchema, type RidePerformanceFilters, type RidePerformanceMetrics } from '@tmlmobilidade/go-types-performance';

import { buildRidePerformanceFilterContext, getMetricDelta, normalizeRidePerformanceMetrics, RIDE_PERFORMANCE_QUANTITY_SELECTION, type RidePerformanceQuantityRow } from './query-support.js';

/* * */

interface ByLineRow extends RidePerformanceQuantityRow {
	agency_id: string
	line_id: string
}

interface LineMetrics {
	agency_id: string
	line_id: string
	metrics: RidePerformanceMetrics
}

/* * */

function buildByLinePeriodQuery(input: RidePerformanceFilters) {
	const context = buildRidePerformanceFilterContext(input);
	return {
		params: context.params,
		query: `
			SELECT
				agency_id,
				line_id,
				${RIDE_PERFORMANCE_QUANTITY_SELECTION}
			FROM performance.ride_service_by_ride
			WHERE ${context.conditions.join('\n\t\t\t\tAND ')}
			GROUP BY agency_id, line_id
			ORDER BY scheduled_rides_qty DESC, agency_id, line_id
		`,
	};
}

async function queryByLinePeriod(input: RidePerformanceFilters): Promise<LineMetrics[]> {
	const { params, query } = buildByLinePeriodQuery(input);
	const rows = await labDb.performance.rideServiceByRide.queryFromString<ByLineRow>(query, params);
	return rows.map(row => ({
		agency_id: row.agency_id,
		line_id: row.line_id,
		metrics: normalizeRidePerformanceMetrics(row),
	}));
}

/* * */

export async function queryRidePerformanceByLine(input: RidePerformanceComparisonQueryInput): Promise<RidePerformanceByLineItem[]> {
	const parsed = RidePerformanceComparisonQueryInputSchema.parse(input);
	const commonFilters = {
		agency_ids: parsed.agency_ids,
		data_statuses: parsed.data_statuses,
		exclude_unknown: parsed.exclude_unknown,
		line_ids: parsed.line_ids,
		pattern_ids: parsed.pattern_ids,
	};
	const [currentRows, comparisonRows] = await Promise.all([
		queryByLinePeriod({ ...commonFilters, ...parsed.current_period }),
		queryByLinePeriod({ ...commonFilters, ...parsed.comparison_period }),
	]);
	const currentByKey = new Map(currentRows.map(row => [`${row.agency_id}:${row.line_id}`, row]));
	const comparisonByKey = new Map(comparisonRows.map(row => [`${row.agency_id}:${row.line_id}`, row]));
	const keys = new Set([...currentByKey.keys(), ...comparisonByKey.keys()]);
	const emptyMetrics = normalizeRidePerformanceMetrics({
		advanced_rides_qty: 0,
		delay_eligible_rides_qty: 0,
		delayed_rides_qty: 0,
		execution_failure_rides_qty: 0,
		observed_start_rides_qty: 0,
		scheduled_rides_qty: 0,
	});

	return RidePerformanceByLineItemSchema.array().parse([...keys].map((key) => {
		const currentRow = currentByKey.get(key);
		const comparisonRow = comparisonByKey.get(key);
		const identity = currentRow ?? comparisonRow;
		if (!identity) throw new Error(`Missing ride-performance line identity for ${key}.`);
		const current = currentRow?.metrics ?? emptyMetrics;
		const comparison = comparisonRow?.metrics ?? emptyMetrics;
		return {
			advances_delta_pp: getMetricDelta(current.advances_pct, comparison.advances_pct),
			agency_id: identity.agency_id,
			comparison,
			coverage_delta_pp: getMetricDelta(current.coverage_pct, comparison.coverage_pct),
			current,
			delays_delta_pp: getMetricDelta(current.delays_pct, comparison.delays_pct),
			line_id: identity.line_id,
			service_delta_pp: getMetricDelta(current.service_pct, comparison.service_pct),
		};
	}));
}

/* * */
