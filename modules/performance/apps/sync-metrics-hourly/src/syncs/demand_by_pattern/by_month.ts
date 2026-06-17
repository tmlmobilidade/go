/* * */

import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { metrics } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { DemandByPatternByDay, Metric } from '@tmlmobilidade/types';

/* * */

export const syncDemandByPatternByMonth = async () => {
	//

	Logger.title(`Sync Demand Metrics by Pattern by Month`);
	const globalTimer = new Timer();

	const METRIC = 'demand_by_pattern_by_month';

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	await metrics.deleteMany({ metric: METRIC });
	Logger.info({ message: `Cleared existing metrics in ${deleteTimer.get()}` });

	//
	// Fetch by_day metrics from the metrics collection

	const fetchTimer = new Timer();

	const metricsCollection = await metrics.getCollection();
	const dailyMetrics = await metricsCollection.find({
		metric: 'demand_by_pattern_by_day',
	}).toArray() as DemandByPatternByDay[];

	Logger.info({ message: `Fetched ${dailyMetrics.length} daily metrics (${fetchTimer.get()})` });

	//
	// Process daily metrics into monthly aggregates

	const patternMap = new Map<string, Metric>();

	for (const dailyMetric of dailyMetrics) {
		const pattern_id = dailyMetric.properties.pattern_id;

		// Initialize pattern if not exists
		if (!patternMap.has(pattern_id)) {
			patternMap.set(pattern_id, {
				data: {} as Record<string, { qty: number }>,
				description: `Aggregated passenger demand for pattern ${pattern_id}`,
				generated_at: new Date(),
				metric: METRIC,
				properties: { pattern_id },
			} as Metric);
		}

		const patternDoc = patternMap.get(pattern_id);

		// Aggregate daily data into months
		for (const [dayKey, dayData] of Object.entries(dailyMetric.data)) {
			const monthKey = dayKey.slice(0, 7); // Extract YYYY-MM from YYYY-MM-DD

			// Initialize month if not exists
			if (!patternDoc.data[monthKey]) {
				patternDoc.data[monthKey] = { qty: 0 };
			}

			// Sum daily quantity into monthly total
			patternDoc.data[monthKey].qty += dayData.qty;
		}
	}

	const results = Array.from(patternMap.values());

	//
	// Insert all metrics

	const insertTimer = new Timer();
	await metrics.insertMany(results);
	Logger.info({ message: `Inserted ${results.length} monthly metrics (${insertTimer.get()})` });

	logMetricToFile({
		approach: { description: 'Aggregate from by_day metrics', key: 'aggregate_from_daily' },
		metric: METRIC,
		queryCount: 1, // Only 1 query to fetch daily metrics
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Processed ${results.length} results (${globalTimer.get()})`);
};

//
