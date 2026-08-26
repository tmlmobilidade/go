/* * */

import { type RidePerformanceComparison, RidePerformanceComparisonQueryInputSchema, RidePerformanceComparisonSchema, type RidePerformanceComparisonQueryInput } from '@tmlmobilidade/go-types-performance';

import { getMetricDelta } from './query-support.js';
import { queryRidePerformanceTotal } from './total.js';

/* * */

export async function queryRidePerformanceComparison(input: RidePerformanceComparisonQueryInput): Promise<RidePerformanceComparison> {
	const parsed = RidePerformanceComparisonQueryInputSchema.parse(input);
	const commonFilters = {
		agency_ids: parsed.agency_ids,
		data_statuses: parsed.data_statuses,
		exclude_unknown: parsed.exclude_unknown,
		line_ids: parsed.line_ids,
		pattern_ids: parsed.pattern_ids,
	};
	const [current, comparison] = await Promise.all([
		queryRidePerformanceTotal({ ...commonFilters, ...parsed.current_period }),
		queryRidePerformanceTotal({ ...commonFilters, ...parsed.comparison_period }),
	]);

	return RidePerformanceComparisonSchema.parse({
		advances_delta_pp: getMetricDelta(current.advances_pct, comparison.advances_pct),
		comparison,
		coverage_delta_pp: getMetricDelta(current.coverage_pct, comparison.coverage_pct),
		current,
		delays_delta_pp: getMetricDelta(current.delays_pct, comparison.delays_pct),
		service_delta_pp: getMetricDelta(current.service_pct, comparison.service_pct),
	});
}

/* * */
