/* * */

import { buildPublishedRideMetrics } from '@/helpers/ride-metrics.js';
import { Dates } from '@tmlmobilidade/dates';
import { cacheDb, hubDepartureDelayMetricsCacheKey, hubServiceComplianceMetricsCacheKey, hubVkmExecutionMetricsCacheKey } from '@tmlmobilidade/go-interfaces-cachedb';
import { queryRidePerformanceDay } from '@tmlmobilidade/go-performance-pckg-scripts';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export async function publishRideMetrics() {
	//

	Logger.title('Publishing ride metrics...');
	const timer = new Timer();
	const referenceNow = Dates.now('Europe/Lisbon');
	const operationalDateStart = Dates.fromOperationalDate(
		referenceNow.operational_date,
		'Europe/Lisbon',
	);
	const ridePerformance = await queryRidePerformanceDay({
		current_cutoff: referenceNow.unix_timestamp,
		operational_date: referenceNow.operational_date_int,
		operational_date_start: operationalDateStart.unix_timestamp,
	});
	const publishedMetrics = buildPublishedRideMetrics(ridePerformance);

	await Promise.all([
		cacheDb.set(hubDepartureDelayMetricsCacheKey, JSON.stringify(publishedMetrics.departureDelays)),
		cacheDb.set(hubServiceComplianceMetricsCacheKey, JSON.stringify(publishedMetrics.serviceCompliance)),
		cacheDb.set(hubVkmExecutionMetricsCacheKey, JSON.stringify(publishedMetrics.vkmExecution)),
	]);

	Logger.success(`Finished publishing ride metrics (${timer.get()})`);

	//
}
