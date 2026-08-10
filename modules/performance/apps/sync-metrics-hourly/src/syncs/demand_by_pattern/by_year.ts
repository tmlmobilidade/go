/* * */

import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { metrics } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { DemandByPatternByMonth, Metric } from '@tmlmobilidade/types';

/* * */

export const syncDemandByPatternByYear = async () => {
	//

	Logger.title(`Sync Demand Metrics by Pattern by Year`);
	const globalTimer = new Timer();

	const METRIC = 'demand_by_pattern_by_year';

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	await metrics.deleteMany({ metric: METRIC });
	Logger.info({ message: `Cleared existing metrics in ${deleteTimer.get()}` });

	//
	// Fetch by_month metrics from the metrics collection

	const fetchTimer = new Timer();

	const metricsCollection = await metrics.getCollection();
	const monthlyMetrics = await metricsCollection.find({
		metric: 'demand_by_pattern_by_month',
	}).toArray() as DemandByPatternByMonth[];

	Logger.info({ message: `Fetched ${monthlyMetrics.length} monthly metrics (${fetchTimer.get()})` });

	//
	// Process monthly metrics into yearly aggregates

	const patternMap = new Map<string, Metric>();

	for (const monthlyMetric of monthlyMetrics) {
		const pattern_id = monthlyMetric.properties.pattern_id;

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

		// Aggregate monthly data into years
		for (const [monthKey, monthData] of Object.entries(monthlyMetric.data)) {
			const yearKey = monthKey.slice(0, 4); // Extract YYYY from YYYY-MM

			// Initialize year if not exists
			if (!patternDoc.data[yearKey]) {
				patternDoc.data[yearKey] = { qty: 0 };
			}

			// Sum monthly quantity into yearly total
			patternDoc.data[yearKey].qty += monthData.qty;
		}
	}

	const results = Array.from(patternMap.values());

	//
	// Insert all metrics

	const insertTimer = new Timer();
	await metrics.insertMany(results);
	Logger.info({ message: `Inserted ${results.length} yearly metrics (${insertTimer.get()})` });

	logMetricToFile({
		approach: { description: 'Aggregate from by_month metrics', key: 'aggregate_from_monthly' },
		metric: METRIC,
		queryCount: 1, // Only 1 query to fetch monthly metrics
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Processed ${results.length} results (${globalTimer.get()})`);
};

//
