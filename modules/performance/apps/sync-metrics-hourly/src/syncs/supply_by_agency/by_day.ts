/* eslint-disable @typescript-eslint/naming-convention */
/* * */

import { dayLabelFromOperationalDate } from '@/utils/day-label.js';
import { type CalendarEntry, Dates } from '@tmlmobilidade/dates';
import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { agencies, metrics, rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { SupplyByAgencyByDay } from '@tmlmobilidade/types';
import pLimit from 'p-limit';

/* * */

/** CM (Carris Metropolitana) agency areas — temporary scope filter */
const CM_AGENCY_IDS = ['41', '42', '43', '44'] as const;
const CM_AGENCY_ID_SET = new Set<string>(CM_AGENCY_IDS);

/* * */

export const syncSupplyByAgencyByDay = async () => {
	Logger.title(`Sync Supply Metrics by Agency by Day`);
	const globalTimer = new Timer();
	const METRIC = 'supply_by_agency_by_day';

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	Logger.info({ message: `Clearing existing '${METRIC}' metrics for CM agencies...` });
	await metrics.deleteMany({
		'metric': METRIC,
		'properties.agency_id': { $in: [...CM_AGENCY_IDS] },
	});
	Logger.info({ message: `Cleared existing metrics in ${deleteTimer.get()}` });

	//
	// Fetch rides collection

	const ridesCollection = await rides.getCollection();

	// Fetch agencies collection + build price map (agency_id -> price_per_km)

	const agenciesCollection = await agencies.getCollection();

	// Mapa: agency_id (string) -> price_per_km (number)
	const pricePerKmByAgency = new Map<string, number>();

	const agenciesDocs = await agenciesCollection
		.find(
			{ _id: { $in: [...CM_AGENCY_IDS] } },
			{
				projection: {
					'_id': 1,
					'financials.price_per_km': 1,
				},
			},
		)
		.toArray();

	for (const a of agenciesDocs) {
		const agencyId = String(a._id);
		const price = Number(a?.financials?.price_per_km ?? 0);
		pricePerKmByAgency.set(agencyId, Number.isFinite(price) ? price : 0);
	}

	// Load calendar JSON

	const calendarJson = await Dates.fetchCalendarData();

	if (!calendarJson.length) {
		throw new Error('Calendar data unavailable — cannot build supply_by_agency_by_day metrics');
	}

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

	const earliestDataNeeded = Dates.now('Europe/Lisbon').set({
		day: 1,
		hour: 4,
		millisecond: 0,
		minute: 0,
		month: 1,
		second: 0,
		year: 2024,
	});

	const latestRide = await ridesCollection.findOne(
		{
			agency_id: { $in: [...CM_AGENCY_IDS] },
			operational_date: { $exists: true, $ne: null },
		},
		{ projection: { operational_date: 1 }, sort: { operational_date: -1 } },
	);

	const latestOperationalData = latestRide?.operational_date;

	if (!latestOperationalData) {
		Logger.info({ message: 'No CM rides with operational_date; using current operational date as upper bound' });
	}

	const latest = latestOperationalData
		? Dates.fromOperationalDate(latestOperationalData, 'Europe/Lisbon')
			.set({ hour: 4, millisecond: 0, minute: 0, second: 0 })
			.plus({ days: 1 })
		: Dates.now('Europe/Lisbon')
			.set({ hour: 4, millisecond: 0, minute: 0, second: 0 })
			.plus({ days: 1 });

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

	Logger.info({ message: [
		`Date range: ${earliestDataNeeded.operational_date} → ${latestOperationalData ?? 'today'}`,
		`Total chunks: ${allTimestampChunks.length}`,
		`CM agencies: ${CM_AGENCY_IDS.join(', ')}`,
	] });

	//
	// Set max concurrent queries

	const limit = pLimit(10);

	//
	// Process each day in parallel

	const agencyMap = new Map<string, SupplyByAgencyByDay>();

	const dayPromises = allTimestampChunks.map((chunkData, chunkIndex) =>
		limit(async () => {
			const chunkTimer = new Timer();
			const dayLabel = dayLabelFromOperationalDate(chunkData.operationalDate);
			const chunkLabel = `${chunkIndex + 1}/${allTimestampChunks.length}`;

			Logger.info({ message: `Chunk ${chunkLabel} START operational_date=${chunkData.operationalDate} (${dayLabel})` });

			try {
				const ridesAgg = await ridesCollection
					.aggregate([
						{
							$match: {
								agency_id: { $in: [...CM_AGENCY_IDS] },
								operational_date: chunkData.operationalDate,
							},
						},
						{
							$project: {
								agency_id: 1,

								// supply
								extension_scheduled: { $ifNull: ['$extension_scheduled', 0] },
								grade: '$analysis.SIMPLE_THREE_VEHICLE_EVENTS.grade',

								// divide apex_on_board_sales_amount and passengers_observed_prepaid_amount fields by 100 before summing
								apex_on_board_sales_amount: {
									$divide: [{ $ifNull: ['$apex_on_board_sales_amount', 0] }, 100],
								},
								apex_on_board_sales_qty: { $ifNull: ['$apex_on_board_sales_qty', 0] },
								apex_validations_qty: { $ifNull: ['$apex_validations_qty', 0] },
								passengers_observed: { $ifNull: ['$passengers_observed', 0] },
								passengers_observed_prepaid_amount: {
									$divide: [{ $ifNull: ['$passengers_observed_prepaid_amount', 0] }, 100],
								},
								passengers_observed_subscription_qty: { $ifNull: ['$passengers_observed_subscription_qty', 0] },
							},
						},
						{
							$addFields: {
								has_realtime_events: { $eq: ['$grade', 'pass'] },
								has_ticketing: {
									$or: [
										{ $gt: ['$apex_validations_qty', 0] },
										{ $gt: ['$apex_on_board_sales_qty', 0] },
										{ $gt: ['$passengers_observed', 0] },
									],
								},
							},
						},
						{
							$addFields: {
								is_valid: {
									$or: ['$has_realtime_events', '$has_ticketing'],
								},
								revenue_row: {
									$add: [
										'$apex_on_board_sales_amount',
										'$passengers_observed_prepaid_amount',
										'$passengers_observed_subscription_qty',
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

								// revenue per trip/day/agency
								revenue_per_trip: { $sum: '$revenue_row' },
							},
						},
					])
					.toArray();

				Logger.info({ message: `Chunk ${chunkLabel} DONE - Found ${ridesAgg.length} agencies (${chunkTimer.get()})` });
				return { dayLabel, ridesAgg };
			} catch (error) {
				Logger.error({ message: `Chunk ${chunkLabel} FAILED operational_date=${chunkData.operationalDate} (${chunkTimer.get()})` });
				Logger.error(error);
				throw error;
			}
		}),
	);

	//
	// Transform into Metric objects

	Logger.info({ message: `Waiting for ${allTimestampChunks.length} chunk aggregations to finish...` });
	const chunksTimer = new Timer();
	const allChunksResults = await Promise.all(dayPromises);
	Logger.info({ message: `All chunk aggregations finished (${chunksTimer.get()})` });

	let skippedCalendarDays = 0;
	const mergeTimer = new Timer();

	for (const { dayLabel, ridesAgg } of allChunksResults) {
		const calendarProps = calendarMap.get(dayLabel);

		if (!calendarProps) {
			skippedCalendarDays++;
			Logger.info({ message: `No calendar entry for ${dayLabel}, skipping day` });
			continue;
		}

		for (const agencyStats of ridesAgg) {
			const agency_id = String(agencyStats._id ?? 'no-agency');

			if (!CM_AGENCY_ID_SET.has(agency_id)) {
				continue;
			}

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

			const price_per_km = pricePerKmByAgency.get(agency_id) ?? 0;

			let cost_per_trip = Number(agencyStats.vkms_scheduled ?? 0) * Number(price_per_km ?? 0);

			// divide the value of vkms_scheduled by 1000 (after obtaining the result)
			cost_per_trip = cost_per_trip / 1000;

			agencyDoc.data[dayLabel] = {
				accomplished_rides: agencyStats.accomplished_rides,
				cost_per_trip,
				day_type: calendarProps.day_type,
				holiday: calendarProps.holiday,
				notes: calendarProps.notes,
				period: calendarProps.period,
				revenue_per_trip: agencyStats.revenue_per_trip ?? 0,
				scheduled_rides: agencyStats.scheduled_rides,
				vkms_observed: agencyStats.vkms_observed,
				vkms_scheduled: agencyStats.vkms_scheduled,
			};
		}
	}

	const results = Array.from(agencyMap.values());

	Logger.info({ message: [
		`Merge finished (${mergeTimer.get()})`,
		`Skipped ${skippedCalendarDays} days without calendar`,
		`Built ${results.length} agency metric documents`,
	] });
	for (const doc of results) {
		Logger.info({ message: `  agency ${doc.properties.agency_id}: ${Object.keys(doc.data).length} days in data` });
	}

	//
	// Insert all metrics

	if (results.length === 0) {
		Logger.info({ message: 'No metric documents to insert — skipping insertMany' });
	} else {
		const insertTimer = new Timer();
		Logger.info({ message: `insertMany starting (${results.length} documents)...` });
		await metrics.insertMany(results);
		Logger.info({ message: `insertMany finished (${insertTimer.get()})` });
	}

	logMetricToFile({
		approach: { description: 'Loop by day, calc in Mongo (Optimized)', key: 'loop_day_mongo_calc' },
		metric: METRIC,
		queryCount: allTimestampChunks.length,
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Processed ${results.length} results (${globalTimer.get()})`);
};
