import { goDb } from '@tmlmobilidade/go-interfaces-godb';
/* * */

import { GO_CM_AGENCY_IDS } from '@/constants.js';
import { dayLabelFromStartIso } from '@/utils/day-label.js';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { type PerformanceCalendarEntry as CalendarEntry, fetchPerformanceCalendar } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type DemandByPatternByDay } from '@tmlmobilidade/go-types-performance';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';
import pLimit from 'p-limit';

/* * */

export const syncDemandByPatternByDay = async () => {
	//

	Logger.title(`Sync Demand Metrics by Pattern by Day`);
	const globalTimer = new Timer();

	const metricKey = 'demand_by_pattern_by_day';

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	Logger.info({ message: `Clearing existing '${metricKey}' metrics...` });
	await goDb.performance.metrics.deleteMany({ metric: metricKey });
	Logger.info({ message: `Cleared existing metrics in ${deleteTimer.get()}` });

	//
	// Read migrated validations through labDb.

	//
	// Load calendar JSON

	const calendarJson = await fetchPerformanceCalendar();

	if (!calendarJson.length) {
		throw new Error('Calendar data unavailable — cannot build demand_by_pattern_by_day metrics');
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

	const earliestDataNeeded = Dates.now('Europe/Lisbon').set(
		{ day: 1, hour: 4, millisecond: 0, minute: 0, month: 1, second: 0, year: 2024 },
	);

	const latest = Dates.now('Europe/Lisbon').set({ hour: 4, millisecond: 0, minute: 0, second: 0 }).plus({ days: 1 });

	const allTimestampChunks: { end: number, endIso: string, start: number, startIso: string }[] = [];

	let cursor = earliestDataNeeded;
	while (cursor.unix_milliseconds < latest.unix_milliseconds) {
		const next = cursor.plus({ days: 1 });
		if (!cursor.iso || !next.iso) throw new Error('Invalid metric date range');
		allTimestampChunks.push({
			end: next.unix_milliseconds,
			endIso: next.iso,
			start: cursor.unix_milliseconds,
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
			const chunkTimer = new Timer();

			const dayLabel = dayLabelFromStartIso(chunkData.startIso);

			const validationsAgg = await labDb.queryFromString<{ _id: null | string, count: number }>(
				`SELECT pattern_id AS _id, toFloat64(count()) AS count
				 FROM simplified_apex.validations FINAL
				 WHERE created_at >= $1 AND created_at < $2
				   AND agency_id IN $3 AND is_passenger = 1
				 GROUP BY pattern_id`,
				{ 1: chunkData.start, 2: chunkData.end, 3: [...GO_CM_AGENCY_IDS] },
			);

			Logger.info({ message: `Chunk ${chunkIndex + 1}/${allTimestampChunks.length} - Found ${validationsAgg.length} patterns (${chunkTimer.get()})` });
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
			const patternId = validation._id ?? 'no-pattern';

			if (!patternMap.has(patternId)) {
				patternMap.set(patternId, {
					data: {},
					description: `Aggregated passengers for the pattern ${patternId}`,
					generated_at: new Date(),
					metric: metricKey,
					properties: { pattern_id: patternId },
				});
			}
			const patternDoc = patternMap.get(patternId);
			if (!patternDoc) throw new Error('Metric group was not initialized');

			patternDoc.data[dayLabel] = {
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

	if (results.length === 0) {
		Logger.info({ message: 'No metric documents to insert — skipping insertMany' });
	} else {
		await goDb.performance.metrics.insertMany(results);
	}

	logMetricToFile({
		approach: { description: 'Loop by day, aggregate in ClickHouse (parallel)', key: 'loop_day_parallel' },
		metric: metricKey,
		queryCount: allTimestampChunks.length,
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Processed ${results.length} results (${globalTimer.get()})`);
};

//
