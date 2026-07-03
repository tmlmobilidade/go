/* * */

import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { metrics } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { DemandByLineByDay, Metric } from '@tmlmobilidade/types';

/* * */

export const syncDemandByLineByMonth = async () => {
	//

	Logger.title(`Sync Demand Metrics by Line by Month`);
	const globalTimer = new Timer();

	const METRIC = 'demand_by_line_by_month';

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
		metric: 'demand_by_line_by_day',
	}).toArray() as DemandByLineByDay[];

	Logger.info({ message: `Fetched ${dailyMetrics.length} daily metrics (${fetchTimer.get()})` });

	//
	// Process daily metrics into monthly aggregates

	const lineMap = new Map<string, Metric>();

	for (const dailyMetric of dailyMetrics) {
		const line_id = dailyMetric.properties.line_id;

		// Initialize line if not exists
		if (!lineMap.has(line_id)) {
			lineMap.set(line_id, {
				data: {} as Record<string, { qty: number }>,
				description: `Aggregated passenger demand for line ${line_id}`,
				generated_at: new Date(),
				metric: METRIC,
				properties: { line_id },
			} as Metric);
		}

		const lineDoc = lineMap.get(line_id);

		// Aggregate daily data into months
		for (const [dayKey, dayData] of Object.entries(dailyMetric.data)) {
			const monthKey = dayKey.slice(0, 7); // Extract YYYY-MM from YYYY-MM-DD

			// Initialize month if not exists
			if (!lineDoc.data[monthKey]) {
				lineDoc.data[monthKey] = { qty: 0 };
			}

			// Sum daily quantity into monthly total
			lineDoc.data[monthKey].qty += dayData.qty;
		}
	}

	const results = Array.from(lineMap.values());

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
