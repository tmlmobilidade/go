/* * */

import { type PassengerDemandBaselineComparison, type PassengerDemandComparison, type RidePerformanceBaselineComparison, type RidePerformanceComparison } from '@tmlmobilidade/go-types-performance';

/* * */

export function toPassengerDemandComparison(
	baseline: PassengerDemandBaselineComparison,
): PassengerDemandComparison {
	const median = baseline.typical?.median ?? null;
	const current = baseline.current.passenger_demand;

	return {
		comparison_qty: median === null ? 0 : Math.round(median),
		current_qty: current,
		difference_pct: median === null || median === 0 ? null : (current - median) / median * 100,
		difference_qty: baseline.delta.passenger_demand ?? current - (median ?? 0),
	};
}

export function toRidePerformanceComparison(
	baseline: RidePerformanceBaselineComparison,
): RidePerformanceComparison {
	const typicalService = baseline.typical.service_pct?.median ?? null;
	const typicalDelays = baseline.typical.delays_pct?.median ?? null;
	const typicalAdvances = baseline.typical.advances_pct?.median ?? null;

	return {
		advances_delta_pp: baseline.delta_pp.advances,
		comparison: {
			...baseline.current,
			advances_pct: typicalAdvances,
			delays_pct: typicalDelays,
			service_pct: typicalService,
		},
		coverage_delta_pp: null,
		current: baseline.current,
		delays_delta_pp: baseline.delta_pp.delays,
		service_delta_pp: baseline.delta_pp.service,
	};
}

/* * */
