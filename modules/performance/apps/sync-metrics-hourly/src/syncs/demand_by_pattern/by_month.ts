/* * */

import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { DemandByPatternByDay, Metric } from '@tmlmobilidade/go-types-performance';
import { metrics } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export const syncDemandByPatternByMonth = async () => {
	//

	Logger.title(`Sync Demand Metrics by Pattern by Month`);
	const globalTimer = new Timer();

	const metricKey = 'demand_by_pattern_by_month';

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
		metric: 'demand_by_pattern_by_day',
	}).toArray() as DemandByPatternByDay[];

	Logger.info({ message: `Fetched ${dailyMetrics.length} daily metrics (${fetchTimer.get()})` });

	//
	// Process daily metrics into monthly aggregates

	const patternMap = new Map<string, Metric>();

	for (const dailyMetric of dailyMetrics) {
		const patternId = dailyMetric.properties.pattern_id;

		// Initialize pattern if not exists
		let patternDoc = patternMap.get(patternId);
		if (!patternDoc) {
			patternDoc = {
				data: {} as Record<string, { qty: number }>,
				description: `Aggregated passenger demand for pattern ${patternId}`,
				generated_at: new Date(),
				metric: metricKey,
				properties: { pattern_id: patternId },
			} as Metric;
			patternMap.set(patternId, patternDoc);
		}

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
		metric: metricKey,
		queryCount: 1, // Only 1 query to fetch daily metrics
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Processed ${results.length} results (${globalTimer.get()})`);
};

//
