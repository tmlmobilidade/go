/* * */

import { Dates } from '@tmlmobilidade/dates';
import { CalendarEntry, fetchCalendarData } from '@tmlmobilidade/go-performance-pckg-dates';
import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { agencies, metrics, rides } from '@tmlmobilidade/interfaces';
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

	// Fetch agencies collection + build price map (agency_id -> price_per_km)

	const agenciesCollection = await agencies.getCollection();

	// Mapa: agency_id (string) -> price_per_km (number)
	const pricePerKmByAgency = new Map<string, number>();

	const agenciesDocs = await agenciesCollection
		.find(
			{},
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

	const earliestDataNeeded = Dates.now('Europe/Lisbon').set({
		day: 1,
		hour: 4,
		millisecond: 0,
		minute: 0,
		month: 1,
		second: 0,
		year: 2024,
	});

	const latestOperationalData = (await ridesCollection.findOne({}, { sort: { operational_date: -1 } })).operational_date;
	const latest = Dates.fromOperationalDate(latestOperationalData, 'Europe/Lisbon')
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

	//
	// Set max concurrent queries

	const limit = pLimit(10);

	//
	// Process each day in parallel

	const agencyMap = new Map<string, SupplyByAgencyByDay>();

	const dayPromises = allTimestampChunks.map((chunkData, chunkIndex) =>
		limit(async () => {
			const chunkTimer = new Timer();
			const dayLabel = new Date(chunkData.start).toISOString().slice(0, 10);

			const ridesAgg = await ridesCollection
				.aggregate([
					{
						$match: {
							operational_date: chunkData.operationalDate,
						},
					},
					{
						$project: {
							agency_id: 1,

							// supply
							extension_scheduled: { $ifNull: ['$extension_scheduled', 0] },
							grade: '$analysis.SIMPLE_THREE_VEHICLE_EVENTS.grade',

							// revenue components
							// divide apex_on_board_sales_amount and passengers_observed_prepaid_amount fields by 100 before summing
							apex_on_board_sales_amount: {
								$divide: [{ $ifNull: ['$apex_on_board_sales_amount', 0] }, 100],
							},
							passengers_observed_prepaid_amount: {
								$divide: [{ $ifNull: ['$passengers_observed_prepaid_amount', 0] }, 100],
							},
							passengers_observed_subscription_qty: { $ifNull: ['$passengers_observed_subscription_qty', 0] },
						},
					},
					{
						$addFields: {
							is_valid: {
								$and: [{ $eq: ['$grade', 'pass'] }],
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

			Logger.info(`Chunk ${chunkIndex + 1}/${allTimestampChunks.length} - Found ${ridesAgg.length} agencies (${chunkTimer.get()})`);
			return { dayLabel, ridesAgg };
		}),
	);

	//
	// Transform into Metric objects

	const allChunksResults = await Promise.all(dayPromises);

	for (const { dayLabel, ridesAgg } of allChunksResults) {
		for (const agencyStats of ridesAgg) {
			const agency_id = String(agencyStats._id ?? 'no-agency');

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

			const price_per_km = pricePerKmByAgency.get(agency_id) ?? 0;

			let cost_per_trip = Number(agencyStats.vkms_scheduled ?? 0) * Number(price_per_km ?? 0);

			// divide the value of vkms_scheduled by 1000 (after obtaining the result)
			cost_per_trip = cost_per_trip / 1000;

			agencyDoc.data[dayLabel] = {
				accomplished_rides: agencyStats.accomplished_rides,
				cost_per_trip,
				day_type: calendarProps?.day_type,
				holiday: calendarProps?.holiday,
				notes: calendarProps?.notes,
				period: calendarProps?.period,
				revenue_per_trip: agencyStats.revenue_per_trip ?? 0,
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
