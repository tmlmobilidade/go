/* * */

import { backfillPassengerDemand } from '@/handlers/passenger-demand/backfill.js';
import { PASSENGER_DEMAND_TIMEZONE } from '@/handlers/passenger-demand/constants.js';
import { refreshDemandFacts } from '@/handlers/passenger-demand/demand-facts.js';
import { refreshRealtimeProjection } from '@/handlers/passenger-demand/realtime-projection.js';
import { getBootstrapStart, getCurrentRefreshRange, getHourlyReconciliationRange, getNightlyReconciliationRange, markBootstrapCompleted, markCurrentRefreshCompleted, markHourlyReconciliationCompleted, markNightlyReconciliationCompleted } from '@/handlers/passenger-demand/refresh-cadence.js';
import { runTrackedRefresh } from '@/handlers/passenger-demand/refresh-tracker.js';
import { Dates } from '@tmlmobilidade/dates';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export async function syncPassengerDemandMetrics(
	referenceNow = Dates.now(PASSENGER_DEMAND_TIMEZONE),
) {
	//

	Logger.title('Sync Passenger Demand Metrics');
	const timer = new Timer();
	const bootstrapStart = await getBootstrapStart(referenceNow);

	//
	// On first startup, establish enough history for comparable-date baselines
	// before calculating the current projection.

	if (bootstrapStart !== null) {
		await backfillPassengerDemand(
			bootstrapStart,
			referenceNow.minus({ days: 1 }).operational_date_int,
			referenceNow,
		);
		markBootstrapCompleted(referenceNow);
	}

	//
	// Refresh the current operational date once for each newly closed minute,
	// then advance the current projection only after those facts are available.

	const currentRange = getCurrentRefreshRange(referenceNow);
	if (currentRange) {
		await runTrackedRefresh(currentRange, async () => {
			const result = await refreshDemandFacts(currentRange);
			await refreshRealtimeProjection(referenceNow, currentRange.cutoff);
			return result;
		});
		markCurrentRefreshCompleted(currentRange.cutoff);
	}

	if (bootstrapStart !== null) {
		Logger.terminate(`Synced Passenger Demand Metrics (${timer.get()})`);
		return;
	}

	//
	// Reconcile recently closed dates hourly to absorb late validations.

	const hourlyRange = getHourlyReconciliationRange(referenceNow);
	if (hourlyRange) {
		await runTrackedRefresh(hourlyRange, () => refreshDemandFacts(hourlyRange));
		markHourlyReconciliationCompleted(referenceNow);
	}

	//
	// Reconcile a wider window once per process day.

	const nightlyRange = getNightlyReconciliationRange(referenceNow);
	if (nightlyRange) {
		await runTrackedRefresh(nightlyRange, () => refreshDemandFacts(nightlyRange));
		markNightlyReconciliationCompleted(referenceNow);
	}

	Logger.terminate(`Synced Passenger Demand Metrics (${timer.get()})`);

	//
}
