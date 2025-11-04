/* * */

import { logMetricToFile } from '@/logMetrics.js';
import { CalendarEntry, fetchCalendarData } from '@/utils.js';
import TIMETRACKER from '@helperkits/timer';
import { metrics, simplifiedApexValidations } from '@tmlmobilidade/interfaces';
import { type DemandByPatternByDay } from '@tmlmobilidade/types';
import { Dates, Logs } from '@tmlmobilidade/utils';
import pLimit from 'p-limit';

/* * */

export const syncDemandByPatternByDay = async () => {
	//

	Logs.title(`Sync Demand Metrics by Pattern by Day`);
	const globalTimer = new TIMETRACKER();

	const METRIC = 'demand_by_pattern_by_day';

	//
	// Delete existing metrics

	const deleteTimer = new TIMETRACKER();
	Logs.info(`Clearing existing '${METRIC}' metrics...`);
	await metrics.deleteMany({ metric: METRIC });
	Logs.info(`Cleared existing metrics in ${deleteTimer.get()}`);

	//
	// Fetch validations collection

	const validationsCollection = await simplifiedApexValidations.getCollection();

	//
	// Load calendar JSON

	const calendarJson = await fetchCalendarData();

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
	// Set max concurrent queries
	const limit = pLimit(10);

	//
	// Process each year in parallel
	const patternMap = new Map<string, DemandByPatternByDay>();

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
						_id: '$pattern_id',
						count: { $sum: 1 },
						day: { $first: dayLabel },
						pattern_id: { $first: '$pattern_id' },
					},
				},
			], { hint: 'is_passenger_1_pattern_id_1_created_at_1' }).toArray();

			Logs.info(`Chunk ${chunkIndex + 1}/${allTimestampChunks.length} - Found ${validationsAgg.length} patterns (${chunkTimer.get()})`);
			return validationsAgg;
		}),
	);

	//
	// Transform into Metric objects

	const allChunksResults = await Promise.all(dayPromises);

	for (const validationsAgg of allChunksResults) {
		for (const validation of validationsAgg) {
			const pattern_id = validation.pattern_id ?? 'no-pattern';
			if (!patternMap.has(pattern_id)) {
				patternMap.set(pattern_id, {
					data: {},
					description: `Aggregated passengers for the pattern ${pattern_id}`,
					generated_at: new Date(),
					metric: METRIC,
					properties: { pattern_id },
				});
			}
			const patternDoc = patternMap.get(pattern_id);

			const calendarProps = calendarMap.get(validation.day);

			patternDoc.data[validation.day] = {
				day_type: calendarProps.day_type,
				holiday: calendarProps.holiday,
				notes: calendarProps.notes,
				period: calendarProps.period,
				qty: validation.count,
			};
		}
	}

	const results = Array.from(patternMap.values());

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

	Logs.terminate(`Processed ${results.length} results (${globalTimer.get()})`);
};

//
