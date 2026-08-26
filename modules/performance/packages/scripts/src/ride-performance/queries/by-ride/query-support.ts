/* * */

import { type RidePerformanceFilters, type RidePerformanceMetrics, RidePerformanceMetricsSchema } from '@tmlmobilidade/go-types-performance';

import { RIDE_PERFORMANCE_DEFINITION_VERSION, RIDE_PERFORMANCE_TIMEZONE, RIDE_PERFORMANCE_UNKNOWN_DIMENSION_ID } from '../../definition.js';

/* * */

export type QueryParam = number | string | string[];

export interface BuiltRidePerformanceQuery {
	params: Record<number, QueryParam>
	query: string
}

export interface RidePerformanceQuantityRow {
	advanced_rides_qty: number | string
	delay_eligible_rides_qty: number | string
	delayed_rides_qty: number | string
	execution_failure_rides_qty: number | string
	observed_start_rides_qty: number | string
	scheduled_rides_qty: number | string
}

interface FilterContext {
	conditions: string[]
	next_param_index: number
	params: Record<number, QueryParam>
}

/* * */

export const RIDE_PERFORMANCE_QUANTITY_SELECTION = `
	sum(advanced_rides_qty) AS advanced_rides_qty,
	sum(delay_eligible_rides_qty) AS delay_eligible_rides_qty,
	sum(delayed_more_than_five_minutes_rides_qty) AS delayed_rides_qty,
	sum(combined_execution_failure_rides_qty) AS execution_failure_rides_qty,
	sum(observed_start_rides_qty) AS observed_start_rides_qty,
	sum(scheduled_rides_until_cutoff_qty) AS scheduled_rides_qty
`;

export const RIDE_PERFORMANCE_LOCAL_HOUR_EXPRESSION = `toHour(fromUnixTimestamp64Milli(interval_start, '${RIDE_PERFORMANCE_TIMEZONE}'))`;

/* * */

function percentage(numerator: number, denominator: number) {
	if (denominator === 0) return null;
	return Math.min(100, Math.max(0, numerator / denominator * 100));
}

function addListFilter(context: FilterContext, column: string, values?: string[]) {
	if (!values?.length) return;
	context.conditions.push(`${column} IN $${context.next_param_index}`);
	context.params[context.next_param_index] = values;
	context.next_param_index += 1;
}

/* * */

export function buildRidePerformanceFilterContext(filters: RidePerformanceFilters): FilterContext {
	const context: FilterContext = {
		conditions: [
			'definition_version = $1',
			'operational_date >= $2',
			'operational_date <= $3',
		],
		next_param_index: 4,
		params: {
			1: RIDE_PERFORMANCE_DEFINITION_VERSION,
			2: filters.start_date,
			3: filters.end_date,
		},
	};

	addListFilter(context, 'agency_id', filters.agency_ids);
	addListFilter(context, 'line_id', filters.line_ids);
	addListFilter(context, 'pattern_id', filters.pattern_ids);
	addListFilter(context, 'data_status', filters.data_statuses);

	if (filters.exclude_unknown) {
		context.conditions.push(`line_id != '${RIDE_PERFORMANCE_UNKNOWN_DIMENSION_ID}'`);
		context.conditions.push(`pattern_id != '${RIDE_PERFORMANCE_UNKNOWN_DIMENSION_ID}'`);
	}

	if (filters.hour_start !== undefined && filters.hour_end !== undefined) {
		const startPlaceholder = `$${context.next_param_index}`;
		context.params[context.next_param_index] = filters.hour_start;
		context.next_param_index += 1;
		const endPlaceholder = `$${context.next_param_index}`;
		context.params[context.next_param_index] = filters.hour_end;
		context.next_param_index += 1;
		context.conditions.push(filters.hour_start <= filters.hour_end
			? `${RIDE_PERFORMANCE_LOCAL_HOUR_EXPRESSION} BETWEEN ${startPlaceholder} AND ${endPlaceholder}`
			: `(${RIDE_PERFORMANCE_LOCAL_HOUR_EXPRESSION} >= ${startPlaceholder} OR ${RIDE_PERFORMANCE_LOCAL_HOUR_EXPRESSION} <= ${endPlaceholder})`);
	}

	return context;
}

export function normalizeRidePerformanceMetrics(row: RidePerformanceQuantityRow): RidePerformanceMetrics {
	const advancedRides = Number(row.advanced_rides_qty);
	const delayEligibleRides = Number(row.delay_eligible_rides_qty);
	const delayedRides = Number(row.delayed_rides_qty);
	const executionFailures = Number(row.execution_failure_rides_qty);
	const observedStarts = Number(row.observed_start_rides_qty);
	const scheduledRides = Number(row.scheduled_rides_qty);

	return RidePerformanceMetricsSchema.parse({
		advanced_rides_qty: advancedRides,
		advances_pct: percentage(advancedRides, observedStarts),
		coverage_pct: percentage(observedStarts, delayEligibleRides),
		delay_eligible_rides_qty: delayEligibleRides,
		delayed_rides_qty: delayedRides,
		delays_pct: percentage(delayedRides, observedStarts),
		execution_failure_rides_qty: executionFailures,
		observed_start_rides_qty: observedStarts,
		scheduled_rides_qty: scheduledRides,
		service_pct: percentage(Math.max(0, scheduledRides - executionFailures), scheduledRides),
	});
}

export function getMetricDelta(current: null | number, comparison: null | number) {
	return current === null || comparison === null ? null : current - comparison;
}

/* * */
