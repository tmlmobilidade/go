/* * */

import { GO_CM_AGENCY_IDS } from '@/constants.js';
import { dayLabelFromOperationalDate } from '@/utils/day-label.js';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { type PerformanceCalendarEntry as CalendarEntry, fetchPerformanceCalendar } from '@tmlmobilidade/go-performance-pckg-scripts';
import { SupplyByAgencyByDay } from '@tmlmobilidade/go-types-performance';
import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';
import pLimit from 'p-limit';

/* * */

/** CM (Carris Metropolitana) agency areas — temporary scope filter */
const GO_CM_AGENCY_ID_SET = new Set<string>(GO_CM_AGENCY_IDS);

/* * */

export const syncSupplyByAgencyByDay = async () => {
	Logger.title(`Sync Supply Metrics by Agency by Day`);
	const globalTimer = new Timer();
	const metricKey = 'supply_by_agency_by_day';

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	Logger.info({ message: `Clearing existing '${metricKey}' metrics for CM agencies...` });
	await goDb.performance.metrics.deleteMany({
		'metric': metricKey,
		'properties.agency_id': { $in: [...GO_CM_AGENCY_IDS] },
	});
	Logger.info({ message: `Cleared existing metrics in ${deleteTimer.get()}` });

	//
	// Fetch rides collection

	// Read rides from ClickHouse; agency pricing remains in goDb.

	// Fetch agencies collection + build price map (agency_id -> price_per_km)

	const agenciesCollection = await goDb.core.agencies.getCollection();

	// Mapa: agency_id (string) -> price_per_km (number)
	const pricePerKmByAgency = new Map<string, number>();

	const agenciesDocs = await agenciesCollection
		.find(
			{ _id: { $in: [...GO_CM_AGENCY_IDS] } },
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

	const calendarJson = await fetchPerformanceCalendar();

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

	const [latestRide] = await labDb.queryFromString<{ operational_date: string }>(
		`SELECT toString(operational_date) AS operational_date
		 FROM operation.rides FINAL
		 WHERE agency_id IN $3
		 ORDER BY operational_date DESC LIMIT 1`,
		{ 3: [...GO_CM_AGENCY_IDS] },
	);

	const latestOperationalData = latestRide?.operational_date;

	if (!latestOperationalData) {
		Logger.info({ message: 'No CM rides with operational_date; using current operational date as upper bound' });
	}

	const latest = latestOperationalData
		? Dates.fromOperationalDateInt(OperationalDateIntSchema.parse(latestOperationalData), 'Europe/Lisbon')
			.set({ hour: 4, millisecond: 0, minute: 0, second: 0 })
			.plus({ days: 1 })
		: Dates.now('Europe/Lisbon')
			.set({ hour: 4, millisecond: 0, minute: 0, second: 0 })
			.plus({ days: 1 });

	const allTimestampChunks: { operationalDate: string, start: number }[] = [];
	let cursor = earliestDataNeeded;
	while (cursor.unix_milliseconds < latest.unix_milliseconds) {
		const next = cursor.plus({ days: 1 });
		if (!cursor.iso || !next.iso) throw new Error('Invalid metric date range');
		allTimestampChunks.push({
			operationalDate: String(cursor.operational_date_int),
			start: cursor.unix_milliseconds,
		});
		cursor = next;
	}

	Logger.info({ message: [
		`Date range: ${earliestDataNeeded.operational_date_int} → ${latestOperationalData ?? 'today'}`,
		`Total chunks: ${allTimestampChunks.length}`,
		`CM agencies: ${GO_CM_AGENCY_IDS.join(', ')}`,
	].join(' | ') });

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
				const ridesAgg = await labDb.queryFromString<{
					_id: string
					accomplished_rides: number
					revenue_per_trip: number
					scheduled_rides: number
					vkms_observed: number
					vkms_scheduled: number
				}>(
					`WITH rides AS (
					   SELECT r.*,
					          (ifNull(a.grade_status = 'pass', false)
					           OR ifNull(r.apex_validations_qty, 0) > 0
					           OR ifNull(r.apex_sales_qty, 0) > 0
					           OR ifNull(r.passengers_observed, 0) > 0) AS is_valid
					   FROM operation.rides AS r FINAL
					   LEFT JOIN (SELECT ride_id, grade_status FROM operation.ride_analysis_simple_three_vehicle_events FINAL
					              WHERE agency_id IN $3 AND operational_date = $1) AS a
					     ON r._id = a.ride_id
					   WHERE r.agency_id IN $3 AND r.operational_date = $1
					 )
					 SELECT agency_id AS _id,
					        toFloat64(countIf(is_valid)) AS accomplished_rides,
					        toFloat64(sumIf(extension_scheduled, is_valid)) AS vkms_observed,
					        toFloat64(count()) AS scheduled_rides,
					        toFloat64(sum(extension_scheduled)) AS vkms_scheduled,
					        sum(ifNull(apex_sales_amount, 0) / 100.0
					            + ifNull(passengers_observed_prepaid_amount, 0) / 100.0
					            + ifNull(passengers_observed_subscription_qty, 0)) AS revenue_per_trip
					 FROM rides GROUP BY agency_id`,
					{ 1: Number(chunkData.operationalDate), 3: [...GO_CM_AGENCY_IDS] },
				);

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
			const agencyId = String(agencyStats._id ?? 'no-agency');

			if (!GO_CM_AGENCY_ID_SET.has(agencyId)) {
				continue;
			}

			if (!agencyMap.has(agencyId)) {
				agencyMap.set(agencyId, {
					data: {},
					description: `Aggregated supply for agency ${agencyId}`,
					generated_at: new Date(),
					metric: metricKey,
					properties: { agency_id: agencyId },
				});
			}

			const agencyDoc = agencyMap.get(agencyId);
			if (!agencyDoc) throw new Error('Metric group was not initialized');

			const pricePerKm = pricePerKmByAgency.get(agencyId) ?? 0;

			let costPerTrip = Number(agencyStats.vkms_scheduled ?? 0) * Number(pricePerKm ?? 0);

			// divide the value of vkms_scheduled by 1000 (after obtaining the result)
			costPerTrip = costPerTrip / 1000;

			agencyDoc.data[dayLabel] = {
				accomplished_rides: agencyStats.accomplished_rides,
				cost_per_trip: costPerTrip,
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
	].join(' | ') });
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
		await goDb.performance.metrics.insertMany(results);
		Logger.info({ message: `insertMany finished (${insertTimer.get()})` });
	}

	logMetricToFile({
		approach: { description: 'Loop by day, calculate in ClickHouse', key: 'loop_day_clickhouse_calc' },
		metric: metricKey,
		queryCount: allTimestampChunks.length,
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Processed ${results.length} results (${globalTimer.get()})`);
};
