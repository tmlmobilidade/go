/* * */

import { type PlansDetailSummary } from '@tmlmobilidade/go-operation-pckg-types';
import { type Plan, PLAN_STATISTICS_VERSION, PlanStatisticsSchema } from '@tmlmobilidade/go-types-operation';

/* * */

/** Only exposes complete trip counts calculated for the current plan and version. */
export function getPlanSummary(plan: Plan): PlansDetailSummary {
	const organizer = plan.apps?.organizer;
	const statisticsApp = plan.apps?.plans_statistics;
	const hasError = organizer?.status === 'error' || statisticsApp?.status === 'error';
	const isCurrent = !!plan.hash && statisticsApp?.version === PLAN_STATISTICS_VERSION && [organizer, statisticsApp].every(app => app?.status === 'complete' && app.last_hash === plan.hash);
	const parsedStatistics = PlanStatisticsSchema.safeParse(isCurrent ? statisticsApp?.statistics : null);
	const statistics = parsedStatistics.success ? parsedStatistics.data : null;

	return {
		status: hasError ? 'error' : statistics ? 'ready' : isCurrent ? 'unavailable' : 'processing',
		trip_count: statistics?.trip_count ?? null,
	};
}
