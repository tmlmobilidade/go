/* * */

import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { DemandByAgencyByDay, Metric } from '@tmlmobilidade/go-types-performance';
import { metrics } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export const syncDemandByAgencyByMonth = async () => {
	//

	Logger.title(`Sync Demand Metrics by Agency by Month`);
	const globalTimer = new Timer();

	const metricKey = 'demand_by_agency_by_month';

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	await metrics.deleteMany({ metric: metricKey });
	Logger.info({ message: `Cleared existing metrics in ${deleteTimer.get()}` });

	//
	// Fetch by_day metrics from the metrics collection

	const fetchTimer = new Timer();

	const metricsCollection = await metrics.getCollection();
	const dailyMetrics = await metricsCollection.find({
		metric: 'demand_by_agency_by_day',
	}).toArray() as DemandByAgencyByDay[];

	Logger.info({ message: `Fetched ${dailyMetrics.length} daily metrics (${fetchTimer.get()})` });

	//
	// Process daily metrics into monthly aggregates

	const agencyMap = new Map<string, Metric>();

	for (const dailyMetric of dailyMetrics) {
		const agencyId = dailyMetric.properties.agency_id;

		// Initialize agency if not exists
		let agencyDoc = agencyMap.get(agencyId);
		if (!agencyDoc) {
			agencyDoc = {
				data: {} as Record<string, { qty: number }>,
				description: `Aggregated passenger demand for agency ${agencyId}`,
				generated_at: new Date(),
				metric: metricKey,
				properties: { agency_id: agencyId },
			} as Metric;
			agencyMap.set(agencyId, agencyDoc);
		}

		// Aggregate daily data into months
		for (const [dayKey, dayData] of Object.entries(dailyMetric.data)) {
			const monthKey = dayKey.slice(0, 7); // Extract YYYY-MM from YYYY-MM-DD

			// Initialize month if not exists
			if (!agencyDoc.data[monthKey]) {
				agencyDoc.data[monthKey] = { qty: 0 };
			}

			// Sum daily quantity into monthly total
			agencyDoc.data[monthKey].qty += dayData.qty;
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
		metric: metricKey,
		queryCount: 1, // Only 1 query to fetch daily metrics
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Processed ${results.length} results (${globalTimer.get()})`);
};

//
