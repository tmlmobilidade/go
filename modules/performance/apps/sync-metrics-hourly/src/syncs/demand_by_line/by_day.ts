/* * */

import { dayLabelFromStartIso } from '@/utils/day-label.js';
import { type CalendarEntry, Dates } from '@tmlmobilidade/dates';
import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { metrics, simplifiedApexValidations } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type DemandByLineByDay } from '@tmlmobilidade/types';
import pLimit from 'p-limit';

/* * */

export const syncDemandByLineByDay = async () => {
	//

	Logger.title(`Sync Demand Metrics by Line by Day`);
	const globalTimer = new Timer();

	const METRIC = 'demand_by_line_by_day';

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	Logger.info({ message: `Clearing existing '${METRIC}' metrics...` });
	await metrics.deleteMany({ metric: METRIC });
	Logger.info({ message: `Cleared existing metrics in ${deleteTimer.get()}` });

	//
	// Fetch validations collection

	const validationsCollection = await simplifiedApexValidations.getCollection();

	//
	// Load calendar JSON

	const calendarJson = await Dates.fetchCalendarData();

	if (!calendarJson.length) {
		throw new Error('Calendar data unavailable — cannot build demand_by_line_by_day metrics');
	}

	//
	// Build a map for fast lookup

	const calendarMap = new Map<string, CalendarEntry>();
	for (const day of calendarJson) {
		const dayString = day.date.toString();
		// convert date to YYYY-MM-DD format
		const formattedDate = `${dayString.slice(0, 4)}-${dayString.slice(4, 6)}-${dayString.slice(6, 8)}`;
		calendarMap.set(formattedDate, day);
	}

	//
	// Define daily chunks

	const earliestDataNeeded = Dates
		.now('Europe/Lisbon')
		.set({ day: 1, hour: 4, millisecond: 0, minute: 0, month: 1, second: 0, year: 2024 });

	const latest = Dates
		.now('Europe/Lisbon')
		.set({ hour: 4, millisecond: 0, minute: 0, second: 0 })
		.plus({ days: 1 });

	const allTimestampChunks: { end: number, endIso: string, start: number, startIso: string }[] = [];

	let cursor = earliestDataNeeded;
	while (cursor.unix_timestamp < latest.unix_timestamp) {
		const next = cursor.plus({ days: 1 });
		allTimestampChunks.push({
			end: next.unix_timestamp,
			endIso: next.iso,
			start: cursor.unix_timestamp,
			startIso: cursor.iso,
		});
		cursor = next;
	}

	//
	// Set max concurrent queries

	const limit = pLimit(10);

	//
	// Process each year in parallel

	const lineMap = new Map<string, DemandByLineByDay>();

	const dayPromises = allTimestampChunks.map((chunkData, chunkIndex) =>
		limit(async () => {
			const chunkTimer = new Timer();

			const dayLabel = dayLabelFromStartIso(chunkData.startIso);

			const validationsAgg = await validationsCollection.aggregate([
				{
					$match: {
						created_at: { $gte: chunkData.start, $lt: chunkData.end },
						is_passenger: true,
					},
				},
				{
					$group: {
						_id: '$line_id',
						count: { $sum: 1 },
					},
				},
			]).toArray();

			Logger.info({ message: `Chunk ${chunkIndex + 1}/${allTimestampChunks.length} - Found ${validationsAgg.length} lines (${chunkTimer.get()})` });
			return { dayLabel, validationsAgg };
		}),
	);

	//
	// Transform into Metric objects

	const allChunksResults = await Promise.all(dayPromises);

	for (const { dayLabel, validationsAgg } of allChunksResults) {
		const calendarProps = calendarMap.get(dayLabel);

		if (!calendarProps) {
			Logger.info({ message: `No calendar entry for ${dayLabel}, skipping day` });
			continue;
		}

		for (const validation of validationsAgg) {
			const line_id = validation._id ?? 'no-line';

			if (!lineMap.has(line_id)) {
				lineMap.set(line_id, {
					data: {},
					description: `Aggregated passengers for the line ${line_id}`,
					generated_at: new Date(),
					metric: METRIC,
					properties: { line_id },
				});
			}
			const lineDoc = lineMap.get(line_id);

			lineDoc.data[dayLabel] = {
				day_type: calendarProps.day_type,
				holiday: calendarProps.holiday,
				notes: calendarProps.notes,
				period: calendarProps.period,
				qty: validation.count,
			};
		}
	}

	const results = Array.from(lineMap.values());

	//
	// Insert all metrics

	if (results.length === 0) {
		Logger.info({ message: 'No metric documents to insert — skipping insertMany' });
	} else {
		await metrics.insertMany(results);
	}

	logMetricToFile({
		approach: { description: 'Loop by day, aggregate on mongo (parallel)', key: 'loop_day_parallel' },
		metric: METRIC,
		queryCount: allTimestampChunks.length,
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Processed ${results.length} results (${globalTimer.get()})`);
};

//
