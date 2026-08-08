/* * */

import { buildPublishedRideMetrics } from '@/helpers/realtime/ride-metrics.js';
import { Dates } from '@tmlmobilidade/dates';
import { cacheDb, hubRealtimeDepartureDelayMetricsCacheKey, hubRealtimeServiceComplianceMetricsCacheKey, hubRealtimeVkmExecutionMetricsCacheKey, legacyHubDepartureDelayMetricsCacheKey, legacyHubServiceComplianceMetricsCacheKey, legacyHubVkmExecutionMetricsCacheKey } from '@tmlmobilidade/go-interfaces-cachedb';
import { queryRidePerformanceDay } from '@tmlmobilidade/go-performance-pckg-scripts';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export async function publishRideMetrics() {
	//

	Logger.title('Publishing Realtime Ride Metrics...');
	const timer = new Timer();
	const referenceNow = Dates.now('Europe/Lisbon');
	// const timezone = 'Europe/Lisbon';
	// const now = Dates.now(timezone);

	// const elapsedOperationalDayMs =
	// 	now.unix_timestamp
	// 	- Dates.fromOperationalDate(now.operational_date, timezone).unix_timestamp;

	// const referenceNow = Dates
	// 	.fromOperationalDate('20260711', timezone)
	// 	.plus({ milliseconds: elapsedOperationalDayMs });
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

	const departureDelays = JSON.stringify(publishedMetrics.departureDelays);
	const serviceCompliance = JSON.stringify(publishedMetrics.serviceCompliance);
	const vkmExecution = JSON.stringify(publishedMetrics.vkmExecution);

	await cacheDb.setMany([
		{ key: hubRealtimeDepartureDelayMetricsCacheKey, value: departureDelays },
		{ key: hubRealtimeServiceComplianceMetricsCacheKey, value: serviceCompliance },
		{ key: hubRealtimeVkmExecutionMetricsCacheKey, value: vkmExecution },
		{ key: legacyHubDepartureDelayMetricsCacheKey, value: departureDelays },
		{ key: legacyHubServiceComplianceMetricsCacheKey, value: serviceCompliance },
		{ key: legacyHubVkmExecutionMetricsCacheKey, value: vkmExecution },
	]);

	Logger.success(`Finished publishing Realtime Ride Metrics (${timer.get()})`);

	//
}
