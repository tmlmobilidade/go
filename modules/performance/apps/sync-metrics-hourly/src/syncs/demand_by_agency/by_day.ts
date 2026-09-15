/* * */

import { LEGACY_CM_AGENCY_IDS } from '@/constants.js';
import { dayLabelFromStartIso } from '@/utils/day-label.js';
import { buildCalendarMap, fetchCalendarData } from '@/utils/fetch-calendar-data.js';
import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { type DemandByAgencyByDay } from '@tmlmobilidade/go-types-performance';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { metrics, simplifiedApexValidations } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import pLimit from 'p-limit';

/* * */

export const syncDemandByAgencyByDay = async () => {
	//

	Logger.title(`Sync Demand Metrics by Agency by Day`);
	const globalTimer = new Timer();

	const metricKey = 'demand_by_agency_by_day';

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	Logger.info({ message: `Clearing existing '${metricKey}' metrics...` });
	await metrics.deleteMany({ metric: metricKey });
	Logger.info({ message: `Cleared existing metrics in ${deleteTimer.get()}` });

	//
	// Fetch validations collection

	const validationsCollection = await simplifiedApexValidations.getCollection();

	//
	// Load calendar JSON

	const calendarJson = await fetchCalendarData();

	if (!calendarJson.length) {
		throw new Error('Calendar data unavailable — cannot build demand_by_agency_by_day metrics');
	}

	//
	// Build a map for fast lookup

	const calendarMap = buildCalendarMap(calendarJson);

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
	while (cursor.unix_milliseconds < latest.unix_milliseconds) {
		const next = cursor.plus({ days: 1 });
		allTimestampChunks.push({
			end: next.unix_milliseconds,
			endIso: next.iso ?? '',
			start: cursor.unix_milliseconds,
			startIso: cursor.iso ?? '',
		});
		cursor = next;
	}

	//
	// Set max concurrent queries

	const limit = pLimit(10);

	//
	// Process each year in parallel

	const agencyMap = new Map<string, DemandByAgencyByDay>();

	const dayPromises = allTimestampChunks.map((chunkData, chunkIndex) =>
		limit(async () => {
			const chunkTimer = new Timer();

			const dayLabel = dayLabelFromStartIso(chunkData.startIso);

			const validationsAgg = await validationsCollection.aggregate([
				{
					$match: {
						agency_id: { $in: [...LEGACY_CM_AGENCY_IDS] },
						created_at: { $gte: chunkData.start, $lt: chunkData.end },
						is_passenger: true,
					},
				},
				{
					$group: {
						_id: '$agency_id',
						count: { $sum: 1 },
					},
				},
			]).toArray();

			Logger.info({ message: `Chunk ${chunkIndex + 1}/${allTimestampChunks.length} - Found ${validationsAgg.length} agencies (${chunkTimer.get()})` });
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
			const agencyId = validation._id ?? 'no-agency';

			// Create or get agency document
			let agencyDoc = agencyMap.get(agencyId);
			if (!agencyDoc) {
				agencyDoc = {
					data: {},
					description: `Aggregated passengers for the agency ${agencyId}`,
					generated_at: new Date(),
					metric: metricKey,
					properties: { agency_id: agencyId },
				};
				agencyMap.set(agencyId, agencyDoc);
			}

			// Update individual agency data
			agencyDoc.data[dayLabel] = {
				day_type: calendarProps.day_type,
				holiday: calendarProps.holiday,
				notes: calendarProps.notes,
				period: calendarProps.period,
				qty: validation.count,
			};
		}
	}

	const results = Array.from(agencyMap.values());

	//
	// Insert all metrics

	if (results.length === 0) {
		Logger.info({ message: 'No metric documents to insert — skipping insertMany' });
	} else {
		await metrics.insertMany(results);
	}

	logMetricToFile({
		approach: { description: 'Loop by day, aggregate on mongo (parallel)', key: 'loop_day_parallel' },
		metric: metricKey,
		queryCount: allTimestampChunks.length,
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Processed ${results.length} results (${globalTimer.get()})`);
};

//
