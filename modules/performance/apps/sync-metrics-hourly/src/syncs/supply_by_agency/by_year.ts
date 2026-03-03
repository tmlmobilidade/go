/* * */

import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { metrics } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { Metric, SupplyByAgencyByMonth } from '@tmlmobilidade/types';

/* * */

export const syncSupplyByAgencyByYear = async () => {
	//

	Logger.title(`Sync Supply Metrics by Agency by Year`);
	const globalTimer = new Timer();

	const METRIC = 'supply_by_agency_by_year';

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	await metrics.deleteMany({ metric: METRIC });
	Logger.info(`Cleared existing metrics in ${deleteTimer.get()}`);

	// Fetch by_month metrics from the metrics collection

	const fetchTimer = new Timer();

	const metricsCollection = await metrics.getCollection();
	const monthlyMetrics = await metricsCollection
		.find({ metric: 'supply_by_agency_by_month' })
		.toArray() as SupplyByAgencyByMonth[];

	Logger.info(`Fetched ${monthlyMetrics.length} monthly metrics (${fetchTimer.get()})`);

	// Process monthly metrics into yearly aggregates

	const agencyMap = new Map<string, Metric>();

	for (const monthlyMetric of monthlyMetrics) {
		const agency_id = monthlyMetric.properties.agency_id;

		// Initialize agency if not exists
		if (!agencyMap.has(agency_id)) {
			agencyMap.set(agency_id, {
				data: {} as Record<
					string,
					{ accomplished_rides: number, cost_per_trip: number, revenue_per_trip: number, scheduled_rides: number, vkms_observed: number, vkms_scheduled: number }>,
				description: `Aggregated supply for agency ${agency_id}`,
				generated_at: new Date(),
				metric: METRIC,
				properties: { agency_id },
			} as Metric);
		}

		const agencyDoc = agencyMap.get(agency_id);

		// Aggregate monthly data into years
		for (const [monthKey, monthData] of Object.entries(monthlyMetric.data)) {
			const yearKey = monthKey.slice(0, 4); // YYYY

			// Initialize year if not exists
			if (!agencyDoc.data[yearKey]) {
				agencyDoc.data[yearKey] = {
					accomplished_rides: 0,
					cost_per_trip: 0,
					revenue_per_trip: 0,
					scheduled_rides: 0,
					vkms_observed: 0,
					vkms_scheduled: 0,
				};
			}

			// Sum monthly quantity into yearly total
			agencyDoc.data[yearKey].scheduled_rides += Number(monthData.scheduled_rides ?? 0);
			agencyDoc.data[yearKey].accomplished_rides += Number(monthData.accomplished_rides ?? 0);
			agencyDoc.data[yearKey].vkms_observed += Number(monthData.vkms_observed ?? 0);
			agencyDoc.data[yearKey].vkms_scheduled += Number(monthData.vkms_scheduled ?? 0);
			agencyDoc.data[yearKey].revenue_per_trip += Number(monthData.revenue_per_trip ?? 0);
			agencyDoc.data[yearKey].cost_per_trip += Number(monthData.cost_per_trip ?? 0);
		}
	}

	const results = Array.from(agencyMap.values());

	// Insert all metrics

	const insertTimer = new Timer();
	await metrics.insertMany(results);
	Logger.info(`Inserted ${results.length} yearly metrics (${insertTimer.get()})`);

	logMetricToFile({
		approach: { description: 'Aggregate from by_month metrics', key: 'aggregate_from_monthly' },
		metric: METRIC,
		queryCount: 1,
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Processed ${results.length} results (${globalTimer.get()})`);
};

//
