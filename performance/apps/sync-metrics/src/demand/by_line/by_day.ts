/* * */

import { logMetricToFile } from '@/logMetrics.js';
import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { metrics, simplifiedApexValidations } from '@tmlmobilidade/interfaces';
import { Metric } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';
import fs from 'fs/promises';
import pLimit from 'p-limit';
import path from 'path';

/* * */

export const syncDemandByLineByDay = async () => {
	//

	LOGGER.title(`Sync Demand Metrics by Line by Day`);
	const globalTimer = new TIMETRACKER();

	const METRIC = 'demand_by_line_by_day';

	//
	// Delete existing metrics

	const deleteTimer = new TIMETRACKER();
	LOGGER.info(`Clearing existing '${METRIC}' metrics...`);
	metrics.deleteMany({ metric: METRIC });
	LOGGER.info(`Cleared existing metrics (${deleteTimer.get()})`);

	//
	// Fetch validations collection

	const validationsCollection = await simplifiedApexValidations.getCollection();

	//
	// Load calendar JSON

	const calendarPath = path.resolve('./src/data/calendar.json');
	const calendarRaw = await fs.readFile(calendarPath, 'utf-8');

	const calendarJson: {
		date: string
		day_type: number
		holiday: number
		notes: string
		period: number
	}[] = JSON.parse(calendarRaw);

	//
	// Build a map for fast lookup

	const calendarMap = new Map<string, typeof calendarJson[0]>();
	for (const day of calendarJson) {
		const dayString = day.date.toString();
		// convert date to YYYY-MM-DD format
		const formattedDate = `${dayString.slice(0, 4)}-${dayString.slice(4, 6)}-${dayString.slice(6, 8)}`;
		calendarMap.set(formattedDate, day);
	}

	//
	// Define daily chunks

	const earliestDataNeeded = Dates.now('Europe/Lisbon').set(
		{ day: 1, hour: 4, millisecond: 0, minute: 0, month: 1, second: 0, year: 2024 },
	);

	const latest = Dates.now('Europe/Lisbon').set({ hour: 4, millisecond: 0, minute: 0, second: 0 }).plus({ days: 1 });

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
	// Process each year in parallel

	const lineMap = new Map<string, Metric>();

	//
	// Set max concurrent queries

	const limit = pLimit(10);

	const dayPromises = allTimestampChunks.map((chunkData, chunkIndex) =>
		limit(async () => {
			const chunkTimer = new TIMETRACKER();

			const dayLabel = new Date(chunkData.start).toISOString().slice(0, 10);

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
						day: { $first: dayLabel },
						line_id: { $first: '$line_id' },
					},
				},
			], { hint: 'is_passenger_1_line_id_1_created_at_1' }).toArray();

			LOGGER.info(`Chunk ${chunkIndex + 1}/${allTimestampChunks.length} - Found ${validationsAgg.length} lines (${chunkTimer.get()})`);
			return validationsAgg;
		}),
	);

	//
	// Transform into Metric objects

	const allChunksResults = await Promise.all(dayPromises);

	for (const validationsAgg of allChunksResults) {
		for (const validation of validationsAgg) {
			const line_id = validation.line_id ?? 'no-line';
			if (!lineMap.has(line_id)) {
				lineMap.set(line_id, {
					data: {} as Record<string, {
						day_type: number
						holiday: number
						notes: string
						period: number
						qty: number
					}>,
					description: `Aggregated passengers for the line ${line_id}`,
					generated_at: new Date(),
					metric: METRIC,
					properties: { line_id },
				} as Metric);
			}
			const lineDoc = lineMap.get(line_id);

			const calendarProps = calendarMap.get(validation.day) ?? {
				day_type: 0,
				holiday: 0,
				notes: '',
				period: 0,
			};

			lineDoc.data[validation.day] = {
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

	await metrics.insertMany(results);

	logMetricToFile({
		approach: { description: 'Loop by day, aggregate on mongo (parallel)', key: 'loop_day_parallel' },
		metric: METRIC,
		queryCount: allTimestampChunks.length,
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	LOGGER.terminate(`Processed ${results.length} results (${globalTimer.get()})`);
};

//
