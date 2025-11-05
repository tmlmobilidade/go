/* * */

import { logMetricToFile } from '@/logMetrics.js';
import { CalendarEntry, fetchCalendarData } from '@/utils.js';
import TIMETRACKER from '@helperkits/timer';
import { metrics, simplifiedApexValidations } from '@go/interfaces';
import { type DemandByAgencyByDay } from '@go/types';
import { Dates, Logs } from '@go/utils';
import pLimit from 'p-limit';

/* * */

export const syncDemandByAgencyByDay = async () => {
	//

	Logs.title(`Sync Demand Metrics by Agency by Day`);
	const globalTimer = new TIMETRACKER();

	const METRIC = 'demand_by_agency_by_day';

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

	const agencyMap = new Map<string, DemandByAgencyByDay>();

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
						_id: '$agency_id',
						agency_id: { $first: '$agency_id' },
						count: { $sum: 1 },
						day: { $first: dayLabel },
					},
				},
			], { hint: 'is_passenger_1_agency_id_1_created_at_1' }).toArray();

			Logs.info(`Chunk ${chunkIndex + 1}/${allTimestampChunks.length} - Found ${validationsAgg.length} agencies (${chunkTimer.get()})`);
			return validationsAgg;
		}),
	);

	//
	// Transform into Metric objects

	const allChunksResults = await Promise.all(dayPromises);

	for (const validationsAgg of allChunksResults) {
		for (const validation of validationsAgg) {
			const agency_id = validation.agency_id ?? 'no-agency';

			// Create or get agency document
			if (!agencyMap.has(agency_id)) {
				agencyMap.set(agency_id, {
					data: {},
					description: `Aggregated passengers for the agency ${agency_id}`,
					generated_at: new Date(),
					metric: METRIC,
					properties: { agency_id },
				});
			}

			// Create or get "all" document for aggregated totals
			if (!agencyMap.has('all')) {
				agencyMap.set('all', {
					data: {},
					description: 'Aggregated passengers for all agencies combined',
					generated_at: new Date(),
					metric: METRIC,
					properties: { agency_id: 'all' },
				});
			}

			const agencyDoc = agencyMap.get(agency_id);
			const allDoc = agencyMap.get('all');
			const calendarProps = calendarMap.get(validation.day);

			// Update individual agency data
			agencyDoc.data[validation.day] = {
				day_type: calendarProps.day_type,
				holiday: calendarProps.holiday,
				notes: calendarProps.notes,
				period: calendarProps.period,
				qty: validation.count,
			};

			// Update "all" aggregated data
			if (!allDoc.data[validation.day]) {
				allDoc.data[validation.day] = {
					day_type: calendarProps.day_type,
					holiday: calendarProps.holiday,
					notes: calendarProps.notes,
					period: calendarProps.period,
					qty: 0,
				};
			}
			allDoc.data[validation.day].qty += validation.count;
		}
	}

	const results = Array.from(agencyMap.values());

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
