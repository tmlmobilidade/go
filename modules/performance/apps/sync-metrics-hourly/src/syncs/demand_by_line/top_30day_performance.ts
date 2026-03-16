/* * */

import { Dates } from '@tmlmobilidade/dates';
import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { metrics } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { DemandByLineByDay, Metric } from '@tmlmobilidade/types';

/* * */

/**
 * Computes and stores the top 10 best and worst performing lines in the last 30 days
 * compared to their year average.
 *
 * This function:
 * - Calculates the average demand for each line over the last 30 days
 * - Calculates the year average demand for each line
 * - Determines the percentage change between the 30-day average and year average
 * - Selects the top 10 best performers (highest positive change) and top 10 worst performers (most negative change)
 * - Builds and stores a new metric document summarizing the results
 *
 * @async
 * @returns {Promise<void>} A promise that resolves when the metric has been computed and stored.
 */
export const computeTop30DayPerformanceByLine = async () => {
	//

	Logger.title(`Compute Top 30-Day Performance by Line`);
	const globalTimer = new Timer();

	const METRIC = 'top_lines_30day_performance';

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	Logger.info(`Clearing existing '${METRIC}' metrics...`);
	await metrics.deleteMany({ metric: METRIC });
	Logger.info(`Cleared existing metrics in ${deleteTimer.get()}`);

	//
	// Calculate date ranges

	const now = Dates.now('Europe/Lisbon');
	const thirtyDaysAgo = now.minus({ days: 30 });
	const oneYearAgo = now.minus({ years: 1 });

	const last30DaysStart = thirtyDaysAgo.iso.slice(0, 10);
	const last30DaysEnd = now.iso.slice(0, 10);
	const yearAgoDate = oneYearAgo.iso.slice(0, 10);

	Logger.info(`Analyzing period: ${last30DaysStart} to ${last30DaysEnd}`);
	Logger.info(`Rolling year baseline: ${yearAgoDate} to ${last30DaysEnd}`);

	//
	// Fetch demand metrics by line by day

	const fetchTimer = new Timer();
	Logger.info(`Fetching demand_by_line_by_day metrics...`);

	const dailyMetrics = await metrics.findMany({
		metric: 'demand_by_line_by_day',
	});

	Logger.info(`Found ${dailyMetrics.length} line metrics (${fetchTimer.get()})`);

	//
	// Process metrics to calculate totals

	const linePerformance: {
		increase_pct: number
		last_30_days_by_day_type: {
			day_type_1: number
			day_type_2: number
			day_type_3: number
		}
		last_30_days_total: number
		line_id: string
		ytd_avg: number
	}[] = [];

	for (const lineMetric of dailyMetrics) {
		const { line_id } = (lineMetric as DemandByLineByDay).properties;
		const dailyData = (lineMetric as DemandByLineByDay).data;

		let last30DaysTotal = 0;
		let last30DaysDays = 0;
		let ytdTotal = 0;
		let ytdDays = 0;

		// Track last 30 days by day type
		const last30DaysByDayType = {
			day_type_1: 0,
			day_type_2: 0,
			day_type_3: 0,
		};

		// Calculate last 30 days total and rolling year average
		for (const [dateKey, dayData] of Object.entries(dailyData)) {
			if (dateKey >= last30DaysStart && dateKey <= last30DaysEnd) {
				last30DaysTotal += dayData.qty || 0;
				last30DaysDays++;

				// Add to day type totals
				const dayType = dayData.day_type;
				if (dayType === '1') {
					last30DaysByDayType.day_type_1 += dayData.qty || 0;
				} else if (dayType === '2') {
					last30DaysByDayType.day_type_2 += dayData.qty || 0;
				} else if (dayType === '3') {
					last30DaysByDayType.day_type_3 += dayData.qty || 0;
				}
			}

			// Calculate rolling year average (365 days)
			if (dateKey >= yearAgoDate && dateKey <= last30DaysEnd) {
				ytdTotal += dayData.qty || 0;
				ytdDays++;
			}
		}

		// Skip lines with insufficient data
		if (last30DaysDays < 15) continue;

		const last30DaysAvg = last30DaysTotal / last30DaysDays;
		const yearAvg = ytdTotal / ytdDays;

		// Skip lines with very low usage (less than 10 passengers/day on average)
		if (yearAvg < 10) continue;

		// Calculate percentage change
		const increasePct = yearAvg === 0 ? 0 : ((last30DaysAvg / yearAvg) - 1) * 100;

		linePerformance.push({
			increase_pct: parseFloat(increasePct.toFixed(2)),
			last_30_days_by_day_type: {
				day_type_1: last30DaysByDayType.day_type_1,
				day_type_2: last30DaysByDayType.day_type_2,
				day_type_3: last30DaysByDayType.day_type_3,
			},
			last_30_days_total: last30DaysTotal,
			line_id,
			ytd_avg: Math.round(yearAvg),
		});
	}

	Logger.info(`Processed ${linePerformance.length} lines with sufficient data`);

	//
	// Sort and get top/bottom performers

	linePerformance.sort((a, b) => b.increase_pct - a.increase_pct);

	const topPerformers = linePerformance.slice(0, 10);
	const worstPerformers = linePerformance.slice(-10).reverse(); // Get last 10 and reverse for worst-first order

	//
	// Build metric data structure

	const topPerformersData: Record<string, {
		increase_pct: number
		last_30_days_by_day_type: {
			day_type_1: number
			day_type_2: number
			day_type_3: number
		}
		last_30_days_total: number
		ytd_avg: number
	}> = {};
	const worstPerformersData: Record<string, {
		increase_pct: number
		last_30_days_by_day_type: {
			day_type_1: number
			day_type_2: number
			day_type_3: number
		}
		last_30_days_total: number
		ytd_avg: number
	}> = {};

	for (const performer of topPerformers) {
		topPerformersData[performer.line_id] = {
			increase_pct: performer.increase_pct,
			last_30_days_by_day_type: performer.last_30_days_by_day_type,
			last_30_days_total: performer.last_30_days_total,
			ytd_avg: performer.ytd_avg,
		};
	}

	for (const performer of worstPerformers) {
		worstPerformersData[performer.line_id] = {
			increase_pct: performer.increase_pct,
			last_30_days_by_day_type: performer.last_30_days_by_day_type,
			last_30_days_total: performer.last_30_days_total,
			ytd_avg: performer.ytd_avg,
		};
	}

	//
	// Create final metric document

	const result = {
		data: {
			top_performers: topPerformersData,
			worst_performers: worstPerformersData,
		},
		description: `Top 10 best and worst performing lines in last 30 days vs rolling 365-day average (${last30DaysStart} to ${last30DaysEnd})`,
		generated_at: new Date(),
		metric: METRIC,
	} as Metric;

	//
	// Insert metric

	await metrics.insertOne(result);

	logMetricToFile({
		approach: { description: 'Analyze last 30 days vs rolling 365-day average from daily metrics', key: 'last_30_days_vs_rolling_year' },
		metric: METRIC,
		queryCount: 1,
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Computed ${METRIC} with ${topPerformers.length} top and ${worstPerformers.length} worst performers (${globalTimer.get()})`);
};

//
