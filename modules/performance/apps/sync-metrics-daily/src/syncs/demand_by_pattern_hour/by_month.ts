import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { metrics } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { DemandByPatternHourByDay, Metric } from '@tmlmobilidade/types';

/* * */

// Helper function to process a batch of daily metrics
function processBatch(
	batch: DemandByPatternHourByDay[],
	patternHourMap: Map<string, Metric>,
	metricName: string,
): void {
	for (const typedMetric of batch) {
		const { hour, line_id, minute, pattern_id } = typedMetric.properties;
		const key = `${pattern_id}_${hour}_${minute}`;

		// Initialize pattern-hour if not exists
		if (!patternHourMap.has(key)) {
			patternHourMap.set(key, {
				data: {} as Record<string, { qty: number }>,
				description: `Aggregated passenger demand for pattern ${pattern_id} at ${hour}:${minute.toString().padStart(2, '0')}`,
				generated_at: new Date(),
				metric: metricName,
				properties: {
					hour,
					line_id,
					minute,
					pattern_id,
				},
			} as Metric);
		}

		const patternHourDoc = patternHourMap.get(key);

		// Aggregate daily data into months
		for (const [dayKey, dayData] of Object.entries(typedMetric.data)) {
			const monthKey = dayKey.slice(0, 7); // Extract YYYY-MM from YYYY-MM-DD

			// Initialize month if not exists
			if (!patternHourDoc.data[monthKey]) {
				patternHourDoc.data[monthKey] = { qty: 0 };
			}

			// Sum daily quantity into monthly total
			patternHourDoc.data[monthKey].qty += dayData.qty;
		}
	}
}

/* * */

export const syncDemandByPatternHourByMonth = async () => {
	//

	Logger.title(`Sync Demand Metrics by Pattern Hour by Month`);
	const globalTimer = new Timer();

	const METRIC = 'demand_by_pattern_hour_by_month';

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	await metrics.deleteMany({ metric: METRIC });
	Logger.info({ message: `Cleared existing metrics in ${deleteTimer.get()}` });

	//
	// Process daily metrics into monthly aggregates using batched streaming

	const streamTimer = new Timer();

	const metricsCollection = await metrics.getCollection();
	const patternHourMap = new Map<string, Metric>();

	// Use batched approach - process in chunks to balance memory usage and performance
	const BATCH_SIZE = 1000;
	const cursor = metricsCollection.find({
		metric: 'demand_by_pattern_hour_by_day',
	});

	let processedCount = 0;
	let batch: DemandByPatternHourByDay[] = [];

	for await (const dailyMetric of cursor) {
		batch.push(dailyMetric as DemandByPatternHourByDay);

		// Process batch when it reaches the target size
		if (batch.length >= BATCH_SIZE) {
			processBatch(batch, patternHourMap, METRIC);
			processedCount += batch.length;
			Logger.info({ message: `Processed ${processedCount} daily metrics...` });
			batch = []; // Clear batch
		}
	}

	// Process remaining items in the final batch
	if (batch.length > 0) {
		processBatch(batch, patternHourMap, METRIC);
		processedCount += batch.length;
	}

	Logger.info({ message: `Streamed and processed ${processedCount} daily metrics in batches of ${BATCH_SIZE} (${streamTimer.get()})` });

	const results = Array.from(patternHourMap.values());

	//
	// Insert all metrics

	const insertTimer = new Timer();
	await metrics.insertMany(results);
	Logger.info({ message: `Inserted ${results.length} monthly metrics (${insertTimer.get()})` });

	logMetricToFile({
		approach: { description: 'Stream daily metrics in batches and aggregate', key: 'batched_stream_aggregate' },
		metric: METRIC,
		queryCount: 1, // Only 1 cursor query
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Processed ${results.length} results (${globalTimer.get()})`);
};

//
