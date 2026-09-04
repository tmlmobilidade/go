'use client';

/* * */

import { type PassengerDemandFiveMinuteTimeGrain } from '@tmlmobilidade/go-types-performance';

import { type PassengerDemandQueryFilters } from './query';
import { usePassengerDemandSeries } from './usePassengerDemandSeries';

/* * */

interface UsePassengerDemandPeriodComparisonOptions {
	comparisonEnabled?: boolean
	comparisonFilters: PassengerDemandQueryFilters
	currentFilters: PassengerDemandQueryFilters
	enabled?: boolean
	grain: PassengerDemandFiveMinuteTimeGrain
}

/* * */

export function usePassengerDemandPeriodComparison({ comparisonEnabled = true, comparisonFilters, currentFilters, enabled = true, grain }: UsePassengerDemandPeriodComparisonOptions) {
	const current = usePassengerDemandSeries({ enabled, filters: currentFilters, grain });
	const comparison = usePassengerDemandSeries({ enabled: enabled && comparisonEnabled, filters: comparisonFilters, grain });
	const currentTotal = current.data?.total;
	const comparisonTotal = comparison.data?.total;
	const difference = currentTotal === undefined || comparisonTotal === undefined ? undefined : {
		comparison_qty: comparisonTotal,
		current_qty: currentTotal,
		difference_pct: comparisonTotal ? (currentTotal - comparisonTotal) / comparisonTotal * 100 : null,
		difference_qty: currentTotal - comparisonTotal,
	};

	return { comparison, current, difference };
}

/* * */
