/* * */

import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { metrics } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { Metric } from '@tmlmobilidade/types';

/* * */

/**
 * Retrieves all unique months in "YYYY-MM" format from documents in the metrics collection
 * that match the specified metric name.
 *
 * Iterates through all documents with the given metric name, extracts month keys from the `data`
 * field, and returns a sorted array of unique months found.
 *
 * @param metricName - The name of the metric to filter documents by.
 * @returns A promise that resolves to a sorted array of unique month strings in "YYYY-MM" format.
 */
const getAllMonthsFromMetrics = async (metricName: Metric['metric']): Promise<string[]> => {
	//

	Logger.info(`Fetching all months from metric '${metricName}'...`);

	const metricsCollection = await metrics.getCollection();

	const monthsSet = new Set<string>();

	const cursor = metricsCollection.find({ metric: metricName });

	let docsCount = 0;
	for await (const doc of cursor) {
		docsCount++;

		const data = doc.data ?? {};
		for (const key of Object.keys(data)) {
			// Match "YYYY-MM" format
			if (/^\d{4}-\d{2}$/.test(key)) {
				monthsSet.add(key);
			}
		}
	}

	const allMonths = Array.from(monthsSet).sort();

	Logger.info(
		`Found ${allMonths.length} unique months from ${docsCount} documents of '${metricName}'.`,
	);

	Logger.divider();

	return allMonths;
};

/* * */

/**
 * Computes and stores the top mean demand by line for each month across all available months.
 *
 * This function performs the following steps:
 * 1. Retrieves all months present in the 'mean_demand_by_line_by_month' metrics.
 * 2. For each month, computes the top mean demand by line and stores the result as a new metric.
 *
 * Done separately for each month to be simpler to debug and re-run for current month when needed.
 *
 * @async
 * @returns {Promise<void>} A promise that resolves when all months have been processed.
 */
export const computeTopMeanDemandByLineByMonth = async () => {
	//

	const globalTimer = new Timer();

	const METRIC = 'top_mean_demand_by_line_by_month' as const;

	//
	// Delete existing metrics

	const metricsCollection = await metrics.getCollection();

	const deleteTimer = new Timer();
	Logger.info(`Clearing existing '${METRIC}' metrics...`);
	await metricsCollection.deleteMany({ metric: METRIC });
	Logger.info(`Cleared existing metrics (${deleteTimer.get()})`);

	Logger.divider();

	//
	// Get all months present in 'mean_demand_by_line_by_month' metrics
	const allMonths = await getAllMonthsFromMetrics('mean_demand_by_line_by_month');
	for (const month of allMonths) {
		await topMeanDemandByLineForMonth(month, METRIC);
	}

	logMetricToFile({
		approach: { description: 'Iterate mean_demand_by_line_by_month for every month', key: 'iterate_mean_demand_by_line_by_month' },
		metric: METRIC,
		queryCount: allMonths.length,
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Processed all months (${allMonths.length}) for ${METRIC} (${globalTimer.get()})`);
};

/* * */

/**
 * Computes and stores the top 10 lines with the highest percentage increase in mean demand
 * for a given month compared to the year-to-date (YTD) average up to that month.
 *
 * This function:
 * - Validates the `yearMonth` input format (`YYYY-MM`).
 * - Fetches demand metrics from the database.
 * - Calculates the YTD average demand for each line up to the specified month.
 * - Determines the percentage increase of the current month's demand over the YTD average.
 * - Selects the top 10 lines with the highest increase.
 * - Builds and inserts a new metric document summarizing the results.
 *
 * @param yearMonth - The year and month to analyze, in the format 'YYYY-MM'.
 * @param METRIC - The metric name to use for the resulting document.
 * @throws {Error} If `yearMonth` is not in the correct format or contains an invalid month.
 */
const topMeanDemandByLineForMonth = async (yearMonth: string, METRIC: string) => {
	//

	const globalTimer = new Timer();

	//
	// Validate yearMonth format

	if (!/^\d{4}-\d{2}$/.test(yearMonth)) {
		throw new Error(`Invalid yearMonth format. Expected 'YYYY-MM', got '${yearMonth}'`);
	}
	const [year, monthStr] = yearMonth.split('-');
	const month = parseInt(monthStr, 10);
	if (month < 1 || month > 12) {
		throw new Error(`Invalid month in yearMonth. Expected 01-12, got '${monthStr}'`);
	}

	//
	// Fetch metrics collection

	const metricsCollection = await metrics.getCollection();
	const cursor = metricsCollection.find({ metric: 'mean_demand_by_line_by_month' }) as AsyncIterable<Metric>;

	const tempResults: {
		increase_pct: number
		line_id: string
		qty: number
		year_avg: number
	}[] = [];

	for await (const doc of cursor) {
		if (doc.metric !== 'mean_demand_by_line_by_month') continue;
		const lineId = doc.properties.line_id;
		const monthlyData = doc.data ?? {};

		//
		// Calculate YTD (year to date) average

		let total = 0;
		let monthsCounted = 0;

		for (let m = 1; m <= month; m++) {
			const label = `${year}-${m.toString().padStart(2, '0')}`;
			if (typeof monthlyData[label]?.total?.qty === 'number') {
				total += monthlyData[label].total.qty;
				monthsCounted++;
			}
		}

		if (monthsCounted === 0) continue;
		const yearAvg = total / monthsCounted;

		//
		// Get current month value

		const currentMonthQty = monthlyData[yearMonth]?.total?.qty ?? 0;
		if (currentMonthQty === 0) continue;

		//
		// Compute increase %

		const increase = yearAvg === 0 ? 0 : ((Number(currentMonthQty) / Number(yearAvg)) - 1) * 100;

		tempResults.push({
			increase_pct: increase,
			line_id: lineId,
			qty: currentMonthQty,
			year_avg: yearAvg,
		});
	}

	//
	// Sort and take top 10

	tempResults.sort((a, b) => b.increase_pct - a.increase_pct);
	const top10 = tempResults.slice(0, 10);

	//
	// Build Metric object

	const data: Record<string, { increase_pct: number, qty: number, year_avg: number }> = {};
	for (const { increase_pct, line_id, qty, year_avg } of top10) {
		data[line_id] = {
			increase_pct: parseFloat(increase_pct.toFixed(2)),
			qty: Math.round(qty),
			year_avg: Math.round(year_avg),
		};
	}

	const result = {
		data,
		description: `Top 10 lines with mean demand above the yearly average for month ${month}-${year}`,
		generated_at: new Date(),
		metric: METRIC,
		properties: { year_month: yearMonth },
	} as Metric;

	//
	// Insert metric

	await metrics.insertOne(result);

	Logger.info(`Computed TopMeanDemandByLineByMonth for ${yearMonth} in ${globalTimer.get()}`);
};

//
