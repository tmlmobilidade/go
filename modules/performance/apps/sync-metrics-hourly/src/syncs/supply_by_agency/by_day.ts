/* * */

import { Dates } from '@tmlmobilidade/dates';
import { CalendarEntry, fetchCalendarData } from '@tmlmobilidade/go-performance-pckg-dates';
import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { metrics, rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { SupplyByAgencyByDay } from '@tmlmobilidade/types';
import pLimit from 'p-limit';

/* * */

export const syncSupplyByAgencyByDay = async () => {
	Logger.title(`Sync Supply Metrics by Agency by Day`);
	const globalTimer = new Timer();
	const METRIC = 'supply_by_agency_by_day';

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	Logger.info(`Clearing existing '${METRIC}' metrics...`);
	await metrics.deleteMany({ metric: METRIC });
	Logger.info(`Cleared existing metrics in ${deleteTimer.get()}`);

	//
	// Fetch rides collection

	const ridesCollection = await rides.getCollection();

	//
	// Load calendar JSON

	const calendarJson = await fetchCalendarData();

	//
	// Build a map for fast lookup

	const calendarMap = new Map<string, CalendarEntry>();
	for (const day of calendarJson) {
		const dayString = day.date.toString();
		const formattedDate = `${dayString.slice(0, 4)}-${dayString.slice(4, 6)}-${dayString.slice(6, 8)}`;
		calendarMap.set(formattedDate, day);
	}

	//
	// Define daily chunks

	const earliestDataNeeded = Dates.now('Europe/Lisbon').set({ day: 1, hour: 4, millisecond: 0, minute: 0, month: 1, second: 0, year: 2024 });

	// Count until end of the current year - change this
	const latest = Dates.now('Europe/Lisbon').set({ day: 1, hour: 3, millisecond: 0, minute: 59, month: 1, second: 59, year: 2026 });

	const allTimestampChunks: { operationalDate: string, start: number }[] = [];
	let cursor = earliestDataNeeded;
	while (cursor.unix_timestamp < latest.unix_timestamp) {
		const next = cursor.plus({ days: 1 });
		allTimestampChunks.push({
			operationalDate: cursor.operational_date,
			start: cursor.unix_timestamp,
		});
		cursor = next;
	}

	//
	// Set max concurrent queries

	const limit = pLimit(10);

	//
	// Process each year in parallel

	const agencyMap = new Map<string, SupplyByAgencyByDay>();

	const dayPromises = allTimestampChunks.map((chunkData, chunkIndex) =>
		limit(async () => {
			const chunkTimer = new Timer();
			const dayLabel = new Date(chunkData.start).toISOString().slice(0, 10);

			const ridesAgg = await ridesCollection.aggregate([
				{
					$match: {
						operational_date: chunkData.operationalDate,
					},
				},
				{
					$project: {
						agency_id: 1,
						extension_scheduled: { $ifNull: ['$extension_scheduled', 0] },
						grade: '$analysis.SIMPLE_THREE_VEHICLE_EVENTS.grade',
						has_analysis: { $cond: [{ $ifNull: ['$analysis', false] }, true, false] },
						passengers_observed: 1,
						system_status: 1,
					},
				},
				{
					$addFields: {
						is_valid: {
							$and: [
								{ $eq: ['$grade', 'pass'] },
							],
						},
					},
				},
				{
					$group: {
						_id: '$agency_id',
						// only valid rides for accomplished count
						accomplished_rides: { $sum: { $cond: ['$is_valid', 1, 0] } },
						vkms_observed: { $sum: { $cond: ['$is_valid', '$extension_scheduled', 0] } },
						// all rides for scheduled counts
						scheduled_rides: { $sum: 1 },
						vkms_scheduled: { $sum: '$extension_scheduled' },
					},
				},
			]).toArray();

			// Check if this index is worth adding
			// operational_date: 1,
			// system_status: 1,
			// agency_id: 1

			Logger.info(`Chunk ${chunkIndex + 1}/${allTimestampChunks.length} - Found ${ridesAgg.length} agencies (${chunkTimer.get()})`);
			return { dayLabel, ridesAgg };
		}),
	);

	//
	// Transform into Metric objects

	const allChunksResults = await Promise.all(dayPromises);

	for (const { dayLabel, ridesAgg } of allChunksResults) {
		for (const agencyStats of ridesAgg) {
			const agency_id = agencyStats._id ?? 'no-agency';

			if (!agencyMap.has(agency_id)) {
				agencyMap.set(agency_id, {
					data: {},
					description: `Aggregated supply for agency ${agency_id}`,
					generated_at: new Date(),
					metric: METRIC,
					properties: { agency_id },
				});
			}

			const agencyDoc = agencyMap.get(agency_id);
			const calendarProps = calendarMap.get(dayLabel);

			// Map the aggregated numbers directly
			agencyDoc.data[dayLabel] = {
				accomplished_rides: agencyStats.accomplished_rides,
				day_type: calendarProps?.day_type,
				holiday: calendarProps?.holiday,
				notes: calendarProps?.notes,
				period: calendarProps?.period,
				scheduled_rides: agencyStats.scheduled_rides,
				vkms_observed: agencyStats.vkms_observed,
				vkms_scheduled: agencyStats.vkms_scheduled,
			};
		}
	}

	const results = Array.from(agencyMap.values());

	//
	// Insert all metrics

	await metrics.insertMany(results);

	logMetricToFile({
		approach: { description: 'Loop by day, calc in Mongo (Optimized)', key: 'loop_day_mongo_calc' },
		metric: METRIC,
		queryCount: allTimestampChunks.length,
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Processed ${results.length} results (${globalTimer.get()})`);
};
