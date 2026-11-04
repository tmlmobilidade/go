/* * */

import { type PlansDetailSummary } from '@tmlmobilidade/go-operation-pckg-types';
import { type Plan, PLAN_STATISTICS_VERSION, PlanStatisticsSchema } from '@tmlmobilidade/go-types-operation';

/* * */

/** Only exposes complete trip counts calculated for the current plan and version. */
export function getPlanSummary(plan: Plan): PlansDetailSummary {
	const organizer = plan.apps?.organizer;
	const statisticsApp = plan.apps?.plans_statistics;
	if (organizer?.status === 'error' || statisticsApp?.status === 'error') {
		return { status: 'error', trip_count: null };
	}

	const isOrganizerCurrent = organizer?.status === 'complete' && organizer.last_hash === plan.hash;
	const isStatisticsCurrent = statisticsApp?.status === 'complete' && statisticsApp.last_hash === plan.hash;

	if (!plan.hash || !isOrganizerCurrent || !isStatisticsCurrent || statisticsApp?.version !== PLAN_STATISTICS_VERSION) {
		return { status: 'processing', trip_count: null };
	}

	const parsedStatistics = PlanStatisticsSchema.safeParse(statisticsApp.statistics);

	if (!parsedStatistics.success) {
		return { status: 'unavailable', trip_count: null };
	}

	return { status: 'ready', trip_count: parsedStatistics.data.trip_count };
}
