/* eslint-disable @typescript-eslint/naming-convention */
/* * */

import { dayLabelFromOperationalDate } from '@/utils/day-label.js';
import { computeSupplyDerivedFields } from '@/utils/supply-derived.js';
import { type CalendarEntry, Dates } from '@tmlmobilidade/dates';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { metrics } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { SupplyByLineByDay } from '@tmlmobilidade/types';
import pLimit from 'p-limit';

/* * */

/** CM (Carris Metropolitana) agency areas — temporary scope filter */
const CM_AGENCY_IDS = ['41', '42', '43', '44'] as const;
const CM_AGENCY_ID_SET = new Set<string>(CM_AGENCY_IDS);

/* * */

export const syncSupplyByLineByDay = async () => {
	Logger.title(`Sync Supply Metrics by Line by Day`);
	const globalTimer = new Timer();
	const METRIC = 'supply_by_line_by_day';

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	Logger.info({ message: `Clearing existing '${METRIC}' metrics...` });
	await metrics.deleteMany({ metric: METRIC });
	Logger.info({ message: `Cleared existing metrics in ${deleteTimer.get()}` });

	//
	// Fetch operation collection

	const ridesCollection = await goDb.operation.rides.getCollection();

	// Fetch agencies collection + build price map (agency_id -> price_per_km)

	const agenciesCollection = await goDb.core.agencies.getCollection();

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
		throw new Error('Calendar data unavailable — cannot build supply_by_line_by_day metrics');
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

	const latestRide = await goDb.operation.rides.findOne(
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

	const lineMap = new Map<string, SupplyByLineByDay>();

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
								line_id: 1,

								// supply
								extension_scheduled: { $ifNull: ['$extension_scheduled', 0] },
								grade: '$analysis.SIMPLE_THREE_VEHICLE_EVENTS.grade',
								passengers_observed: { $ifNull: ['$passengers_observed', 0] },

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
								_id: '$line_id',

								agency_id: { $first: '$agency_id' },

								// only valid rides for accomplished count
								accomplished_rides: { $sum: { $cond: ['$is_valid', 1, 0] } },
								vkms_observed: { $sum: { $cond: ['$is_valid', '$extension_scheduled', 0] } },

								// all rides for scheduled counts
								passengers_observed: { $sum: '$passengers_observed' },
								scheduled_rides: { $sum: 1 },
								vkms_scheduled: { $sum: '$extension_scheduled' },

								// revenue per trip/day/line
								revenue: { $sum: '$revenue_row' },
							},
						},
					])
					.toArray();

				Logger.info({ message: `Chunk ${chunkLabel} DONE - Found ${ridesAgg.length} lines (${chunkTimer.get()})` });
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

		for (const lineStats of ridesAgg) {
			const line_id = String(lineStats._id ?? 'no-line');
			const agency_id = String(lineStats.agency_id ?? 'no-agency');

			if (!CM_AGENCY_ID_SET.has(agency_id)) {
				continue;
			}

			if (!lineMap.has(line_id)) {
				lineMap.set(line_id, {
					data: {},
					description: `Aggregated supply for line ${line_id}`,
					generated_at: new Date(),
					metric: METRIC,
					properties: { line_id },
				});
			}

			const lineDoc = lineMap.get(line_id);

			const price_per_km = pricePerKmByAgency.get(agency_id) ?? 0;

			// cost = vkms_scheduled * price_per_km / 1000
			const cost = (Number(lineStats.vkms_scheduled ?? 0) * Number(price_per_km ?? 0)) / 1000;
			const revenue = Number(lineStats.revenue ?? 0);
			const passengers_observed = Number(lineStats.passengers_observed ?? 0);
			const derived = computeSupplyDerivedFields(cost, revenue, passengers_observed);

			lineDoc.data[dayLabel] = {
				accomplished_rides: lineStats.accomplished_rides,
				cost,
				cost_per_pax: derived.cost_per_pax,
				day_type: calendarProps.day_type,
				holiday: calendarProps.holiday,
				net_result: derived.net_result,
				notes: calendarProps.notes,
				passengers_observed,
				period: calendarProps.period,
				revenue,
				revenue_per_pax: derived.revenue_per_pax,
				scheduled_rides: lineStats.scheduled_rides,
				vkms_observed: lineStats.vkms_observed,
				vkms_scheduled: lineStats.vkms_scheduled,
			};
		}
	}

	const results = Array.from(lineMap.values());

	Logger.info({ message: [
		`Merge finished (${mergeTimer.get()})`,
		`Skipped ${skippedCalendarDays} days without calendar`,
		`Built ${results.length} line metric documents`,
	] });
	for (const doc of results) {
		Logger.info({ message: `  line ${doc.properties.line_id}: ${Object.keys(doc.data).length} days in data` });
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
