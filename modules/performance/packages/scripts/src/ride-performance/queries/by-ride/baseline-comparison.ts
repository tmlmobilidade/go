/* * */

import { COMPARABLE_WEEKDAY_SAMPLE_SIZE, getComparableOperationalDates } from '@/comparable-operational-dates.js';
import { median, quantile } from '@/statistics/quantile.js';
import { type RidePerformanceBaselineComparison, RidePerformanceBaselineComparisonQueryInputSchema, RidePerformanceBaselineComparisonSchema, type RidePerformanceBaselineComparisonQueryInput } from '@tmlmobilidade/go-types-performance';

import { getMetricDelta } from './query-support.js';
import { queryRidePerformanceTotal } from './total.js';

/* * */

function buildTypicalRange(values: Array<null | number>) {
	const defined = values.filter((value): value is number => value !== null);
	const typicalMedian = median(defined);
	const typicalLower = quantile(defined, 0.25);
	const typicalUpper = quantile(defined, 0.75);
	if (typicalMedian === null || typicalLower === null || typicalUpper === null) return null;
	return { lower: typicalLower, median: typicalMedian, upper: typicalUpper };
}

export async function queryRidePerformanceBaselineComparison(
	input: RidePerformanceBaselineComparisonQueryInput,
): Promise<RidePerformanceBaselineComparison> {
	const parsed = RidePerformanceBaselineComparisonQueryInputSchema.parse(input);
	const sampleTarget = parsed.sample_size ?? COMPARABLE_WEEKDAY_SAMPLE_SIZE;
	const operationalDate = parsed.operational_date;
	const commonFilters = {
		agency_ids: parsed.agency_ids,
		data_statuses: parsed.data_statuses,
		exclude_unknown: parsed.exclude_unknown,
		line_ids: parsed.line_ids,
		pattern_ids: parsed.pattern_ids,
	};
	const [current, ...baselineCandidates] = await Promise.all([
		queryRidePerformanceTotal({
			...commonFilters,
			end_date: operationalDate,
			start_date: operationalDate,
		}),
		...getComparableOperationalDates(operationalDate, sampleTarget).map(async (baselineDate) => {
			const metrics = await queryRidePerformanceTotal({
				...commonFilters,
				end_date: baselineDate,
				start_date: baselineDate,
			});
			return { metrics, operational_date: baselineDate };
		}),
	]);
	const baselineRows = baselineCandidates.filter(row => row.metrics.scheduled_rides_qty > 0);
	const pickMetric = (key: 'advances_pct' | 'delays_pct' | 'service_pct') =>
		baselineRows.map(row => row.metrics[key]);
	const typicalService = buildTypicalRange(pickMetric('service_pct'));
	const typicalDelays = buildTypicalRange(pickMetric('delays_pct'));
	const typicalAdvances = buildTypicalRange(pickMetric('advances_pct'));

	return RidePerformanceBaselineComparisonSchema.parse({
		current,
		delta_pp: {
			advances: getMetricDelta(current.advances_pct, typicalAdvances?.median ?? null),
			delays: getMetricDelta(current.delays_pct, typicalDelays?.median ?? null),
			service: getMetricDelta(current.service_pct, typicalService?.median ?? null),
		},
		meta: {
			baseline_operational_dates: baselineRows.map(row => row.operational_date),
			baseline_sample_size: baselineRows.length,
			baseline_sample_target: sampleTarget,
		},
		typical: {
			advances_pct: typicalAdvances,
			delays_pct: typicalDelays,
			service_pct: typicalService,
		},
	});
}

/* * */
