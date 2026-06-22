/* * */

import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { metrics } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type Metric } from '@tmlmobilidade/types';

/* * */

const dayTypeMap: Record<string, string> = {
	1: 'weekday',
	2: 'saturday',
	3: 'sunday',
};

/* * */

export const computeMeanDemandByLineByMonth = async () => {
	//

	Logger.title(`Compute Mean Demand by Line by Month`);
	const globalTimer = new Timer();

	const METRIC = 'mean_demand_by_line_by_month' as const;

	const metricsCollection = await metrics.getCollection();

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	Logger.info({ message: `Clearing existing ${METRIC} metrics...` });
	await metricsCollection.deleteMany({ metric: METRIC });
	Logger.info({ message: `Cleared existing metrics (${deleteTimer.get()})` });

	//
	// Fetch metrics collection

	const cursor = metricsCollection.find({ metric: 'demand_by_line_by_day' }) as AsyncIterable<Metric>;

	const results: Metric[] = [];

	for await (const lineDoc of cursor) {
		if (lineDoc.metric !== 'demand_by_line_by_day') continue;
		const lineId = lineDoc.properties.line_id;

		const monthly: Record<
			string,
			Record<string, { avg?: number, count: number, qty: number }>
		> = {};

		for (const [dateStr, { day_type, qty }] of Object.entries(lineDoc.data)) {
			const month = dateStr.slice(0, 7);
			monthly[month] = monthly[month] || {};

			const dayTypeName = dayTypeMap[day_type.toString()] || `unknown_${day_type}`;

			const cur = monthly[month][dayTypeName] ?? { count: 0, qty: 0 };
			cur.qty += qty;
			cur.count += 1;
			monthly[month][dayTypeName] = cur;
		}

		for (const month of Object.keys(monthly)) {
			const totalEntry = { avg: 0, count: 0, qty: 0 };

			for (const dayType of Object.keys(monthly[month])) {
				//
				// Calculate the average and round to the nearest whole number
				monthly[month][dayType].avg = Math.round(monthly[month][dayType].qty / monthly[month][dayType].count);

				// Add to totals
				totalEntry.qty += monthly[month][dayType].qty;
				totalEntry.count += monthly[month][dayType].count;
			}

			// Calculate average for totals
			if (totalEntry.count > 0) {
				totalEntry.avg = Math.round(totalEntry.qty / totalEntry.count);
			}

			// Add total to the month data
			monthly[month].total = totalEntry;
		}

		results.push({
			data: monthly,
			description: `Mean passengers per day type per month for line ${lineId}`,
			generated_at: new Date(),
			metric: METRIC,
			properties: { line_id: lineId },
		} as Metric);
	}

	//
	// Insert all metrics

	await metricsCollection.insertMany(results);

	logMetricToFile({
		approach: { description: 'Iterate demand_by_line_by_day', key: 'iterate_demand_by_line_by_day' },
		metric: METRIC,
		queryCount: 1,
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Processed ${results.length} results (${globalTimer.get()})`);
};

//
