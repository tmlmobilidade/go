/* * */

import { getHistoricalDemandMetricsPublishSlot } from '@/helpers/historical/demand-metrics.js';
import { cacheDb, hubHistoricalDemandByAgencyMetricsCacheKey } from '@tmlmobilidade/go-interfaces-cachedb';
import { queryDailyPassengerDemandOverTimeByAgency } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type DemandByAgencyMetricsByTimeGrain, DemandByAgencyMetricsByTimeGrainSchema } from '@tmlmobilidade/go-types-performance';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

let LAST_COMPLETED_PUBLISH_SLOT: null | number = null;

/* * */

export function parseDemandByAgencyMetricsCacheValue(
	value: unknown,
): DemandByAgencyMetricsByTimeGrain {
	return DemandByAgencyMetricsByTimeGrainSchema.parse(value);
}

async function fetchDemandByAgencyMetrics() {
	const [day, month, year] = await Promise.all([
		queryDailyPassengerDemandOverTimeByAgency({ time_grain: 'day' }),
		queryDailyPassengerDemandOverTimeByAgency({ time_grain: 'month' }),
		queryDailyPassengerDemandOverTimeByAgency({ time_grain: 'year' }),
	]);

	return parseDemandByAgencyMetricsCacheValue({ day, month, year });
}

/* * */

export async function publishDemandByAgencyMetrics(
	referenceTimestamp = Date.now(),
) {
	const publishSlot = getHistoricalDemandMetricsPublishSlot(referenceTimestamp);
	if (LAST_COMPLETED_PUBLISH_SLOT === publishSlot) return;

	Logger.title('Publishing Historical Demand by Agency Metrics...');
	const timer = new Timer();
	const metrics = await fetchDemandByAgencyMetrics();

	await cacheDb.set(
		hubHistoricalDemandByAgencyMetricsCacheKey,
		JSON.stringify(metrics),
	);

	LAST_COMPLETED_PUBLISH_SLOT = publishSlot;
	Logger.success(`Finished publishing Historical Demand by Agency Metrics (${timer.get()})`);
}
