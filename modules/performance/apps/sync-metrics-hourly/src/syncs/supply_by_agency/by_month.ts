/* * */

import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { metrics } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { Metric, SupplyByAgencyByDay } from '@tmlmobilidade/types';

/* * */

export const syncSupplyByAgencyByMonth = async () => {
	Logger.title(`Sync Supply Metrics by Agency by Month`);
	const globalTimer = new Timer();

	const METRIC = 'supply_by_agency_by_month';

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	await metrics.deleteMany({ metric: METRIC });
	Logger.info({ message: `Cleared existing metrics in ${deleteTimer.get()}` });

	// Fetch by_day metrics from the metrics collection

	const fetchTimer = new Timer();

	const metricsCollection = await metrics.getCollection();
	const dailyMetrics = await metricsCollection
		.find({ metric: 'supply_by_agency_by_day' })
		.toArray() as SupplyByAgencyByDay[];

	Logger.info({ message: `Fetched ${dailyMetrics.length} daily metrics (${fetchTimer.get()})` });

	//
	// Process daily metrics into monthly aggregates

	const agencyMap = new Map<string, Metric>();

	for (const dailyMetric of dailyMetrics) {
		const agency_id = dailyMetric.properties.agency_id;

		// Initialize agency if not exists
		if (!agencyMap.has(agency_id)) {
			agencyMap.set(agency_id, {
				data: {} as Record<string, { accomplished_rides: number, cost_per_trip: number, revenue_per_trip: number, scheduled_rides: number, vkms_observed: number, vkms_scheduled: number }>,
				description: `Aggregated supply for agency ${agency_id}`,
				generated_at: new Date(),
				metric: METRIC,
				properties: { agency_id },
			} as Metric);
		}

		const agencyDoc = agencyMap.get(agency_id);

		// Aggregate daily data into months
		for (const [dayKey, dayData] of Object.entries(dailyMetric.data)) {
			const monthKey = dayKey.slice(0, 7); // YYYY-MM

			// Initialize month if not exists
			if (!agencyDoc.data[monthKey]) {
				agencyDoc.data[monthKey] = { accomplished_rides: 0, cost_per_trip: 0, revenue_per_trip: 0, scheduled_rides: 0, vkms_observed: 0, vkms_scheduled: 0 };
			}

			// Sum daily quantity into monthly total
			agencyDoc.data[monthKey].scheduled_rides += Number(dayData.scheduled_rides ?? 0);
			agencyDoc.data[monthKey].accomplished_rides += Number(dayData.accomplished_rides ?? 0);
			agencyDoc.data[monthKey].vkms_observed += Number(dayData.vkms_observed ?? 0);
			agencyDoc.data[monthKey].vkms_scheduled += Number(dayData.vkms_scheduled ?? 0);
			agencyDoc.data[monthKey].revenue_per_trip += Number(dayData.revenue_per_trip ?? 0);
			agencyDoc.data[monthKey].cost_per_trip += Number(dayData.cost_per_trip ?? 0);
		}
	}

	const results = Array.from(agencyMap.values());

	//
	// Insert all metrics

	const insertTimer = new Timer();
	await metrics.insertMany(results);
	Logger.info({ message: `Inserted ${results.length} monthly metrics (${insertTimer.get()})` });

	logMetricToFile({
		approach: { description: 'Aggregate from by_day metrics', key: 'aggregate_from_daily' },
		metric: METRIC,
		queryCount: 1,
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Processed ${results.length} results (${globalTimer.get()})`);
};

//
