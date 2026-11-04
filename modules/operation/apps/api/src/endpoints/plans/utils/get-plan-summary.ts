/* * */

import { type PlansDetailSummary } from '@tmlmobilidade/go-operation-pckg-types';
import { AgencyPricePerKmSchema } from '@tmlmobilidade/go-types-core';
import { type Plan, PlanStatisticsSchema } from '@tmlmobilidade/go-types-operation';

/* * */

/** Combines a current, complete service summary with the agency's current rate. */
export function getPlanSummary(plan: Plan, pricePerKm: unknown): PlansDetailSummary {
	const organizer = plan.apps?.organizer;
	const statisticsApp = plan.apps?.plans_statistics;
	const hasError = organizer?.status === 'error' || statisticsApp?.status === 'error';
	const isCurrent = !!plan.hash && [organizer, statisticsApp].every(app => app?.status === 'complete' && app.last_hash === plan.hash);
	const parsedStatistics = PlanStatisticsSchema.safeParse(isCurrent ? statisticsApp?.statistics : null);
	const statistics = parsedStatistics.success ? parsedStatistics.data : null;
	const kilometers = statistics ? statistics.distance_meters / 1000 : null;
	const priceMissing = pricePerKm == null || (typeof pricePerKm === 'string' && !pricePerKm.trim());
	const parsedPrice = AgencyPricePerKmSchema.safeParse(pricePerKm);
	const price = parsedPrice.success ? parsedPrice.data : null;
	const amount = kilometers !== null && price !== null ? kilometers * price : null;

	return {
		cost_status: priceMissing ? 'missing_configuration'
			: !parsedPrice.success || (amount !== null && !Number.isFinite(amount)) ? 'invalid_configuration'
				: amount === null ? 'statistics_unavailable' : 'ready',
		estimated_cost: amount !== null && Number.isFinite(amount) ? amount : null,
		kilometers,
		line_count: statistics?.line_count ?? null,
		price_per_km: price,
		status: hasError ? 'error' : statistics ? 'ready' : isCurrent ? 'unavailable' : 'processing',
		trip_count: statistics?.trip_count ?? null,
	};
}
