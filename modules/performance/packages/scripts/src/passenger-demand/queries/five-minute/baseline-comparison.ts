/* * */

import { COMPARABLE_WEEKDAY_SAMPLE_SIZE, getComparableOperationalDates } from '@/comparable-operational-dates.js';
import { median, quantile } from '@/statistics/quantile.js';
import { type PassengerDemandBaselineComparison, type PassengerDemandBaselineComparisonQueryInput, PassengerDemandBaselineComparisonQueryInputSchema, PassengerDemandBaselineComparisonSchema } from '@tmlmobilidade/go-types-performance';

import { queryFiveMinutePassengerDemandTotal } from './demand-total.js';

/* * */

function getDelta(current: number, typical: null | number) {
	return typical === null ? null : current - typical;
}

export async function queryFiveMinutePassengerDemandBaselineComparison(
	input: PassengerDemandBaselineComparisonQueryInput,
): Promise<PassengerDemandBaselineComparison> {
	const parsed = PassengerDemandBaselineComparisonQueryInputSchema.parse(input);
	const sampleTarget = parsed.sample_size ?? COMPARABLE_WEEKDAY_SAMPLE_SIZE;
	const operationalDate = parsed.operational_date;
	const commonFilters = {
		agency_ids: parsed.agency_ids,
		data_statuses: parsed.data_statuses,
		exclude_unknown: parsed.exclude_unknown,
		line_ids: parsed.line_ids,
		pattern_ids: parsed.pattern_ids,
		stop_ids: parsed.stop_ids,
	};
	const [current, ...baselineCandidates] = await Promise.all([
		queryFiveMinutePassengerDemandTotal({
			...commonFilters,
			end_date: operationalDate,
			start_date: operationalDate,
		}),
		...getComparableOperationalDates(operationalDate, sampleTarget).map(async (baselineDate) => {
			const total = await queryFiveMinutePassengerDemandTotal({
				...commonFilters,
				end_date: baselineDate,
				start_date: baselineDate,
			});
			return { operational_date: baselineDate, passenger_demand: total.passenger_demand };
		}),
	]);
	const baselineRows = baselineCandidates.filter(row => row.passenger_demand > 0);
	const baselineValues = baselineRows.map(row => row.passenger_demand);
	const typicalMedian = median(baselineValues);
	const typicalLower = quantile(baselineValues, 0.25);
	const typicalUpper = quantile(baselineValues, 0.75);

	return PassengerDemandBaselineComparisonSchema.parse({
		current: { passenger_demand: current.passenger_demand },
		delta: { passenger_demand: getDelta(current.passenger_demand, typicalMedian) },
		meta: {
			baseline_operational_dates: baselineRows.map(row => row.operational_date),
			baseline_sample_size: baselineRows.length,
			baseline_sample_target: sampleTarget,
		},
		typical: typicalMedian === null || typicalLower === null || typicalUpper === null
			? null
			: { lower: typicalLower, median: typicalMedian, upper: typicalUpper },
	});
}

/* * */
