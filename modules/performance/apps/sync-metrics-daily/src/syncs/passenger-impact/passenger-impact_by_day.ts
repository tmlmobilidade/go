import { GO_CM_AGENCY_IDS } from '@/constants.js';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type OperationalDate, OperationalDateSchema } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';
import { Interval } from 'luxon';

type AgencyId = string;
type PatternHour = string;

interface PassengerAggRow {
	agency_id: AgencyId
	pattern_hour: PatternHour
	values: number[]
}

interface AgencyDayStats {
	estimated_affected_passengers: number
	failed_circulations: number
}

// Median of a numeric array
function median(values: number[]): number {
	if (values.length === 0) return 0;
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 === 0
		? (sorted[mid - 1] + sorted[mid]) / 2
		: sorted[mid];
}

export async function syncPassengerImpactServiceFailuresByDay(): Promise<
	Map<OperationalDate, Map<AgencyId, AgencyDayStats>>
> {
	// Target interval (operational cut-off at 04:00)
	const startDate = Dates.now('Europe/Lisbon')
		.set({ day: 1, hour: 4, month: 1, year: 2024 })
		.unix_milliseconds;

	const endDate = Dates.now('Europe/Lisbon')
		.set({ hour: 4 })
		.unix_milliseconds;

	// Rolling 30-day window (aligned with the 04:00 operational cut-off)
	const allDaysChunks = Interval
		.fromISO(`${Dates.fromUnixMilliseconds(startDate).iso}/${Dates.fromUnixMilliseconds(endDate).iso}`)
		.splitBy({ day: 1 })
		.map((interval) => {
			if (!interval.start || !interval.end) throw new Error('Invalid passenger impact date interval');
			return { end: interval.end.toMillis(), start: interval.start.toMillis() };
		});

	// 1) Failed rides in the target interval -> operationalDayMap[opDate][agency] = Set(patternHour)
	Logger.info({ message: 'Fetching failed pattern-hours in the target interval...' });
	const ridesCursor = await labDb.queryFromString<{
		agency_id: string
		operational_date: OperationalDate
		pattern_hour: string
	}>(
		`SELECT DISTINCT r.agency_id, toString(r.operational_date) AS operational_date,
		        concat(r.shape_id, '_', formatDateTime(fromUnixTimestamp64Milli(r.start_time_scheduled, 'Europe/Lisbon'), '%H:%i')) AS pattern_hour
		 FROM operation.rides AS r FINAL
		 INNER JOIN (SELECT ride_id, grade_status FROM operation.ride_analysis_simple_one_apex_validation FINAL) AS a
		   ON r._id = a.ride_id
		 INNER JOIN (SELECT ride_id, grade_status FROM operation.ride_analysis_simple_three_vehicle_events FINAL) AS v
		   ON r._id = v.ride_id
		 WHERE r.agency_id IN $3 AND r.start_time_scheduled >= $1 AND r.start_time_scheduled < $2
		   AND a.grade_status = 'fail' AND v.grade_status = 'fail'`,
		{ 1: startDate, 2: endDate, 3: [...GO_CM_AGENCY_IDS] },
	);
	Logger.info({ message: `Found ${ridesCursor.length} failed pattern-hours in the target interval.` });

	const operationalDayMap = new Map<OperationalDate, Map<AgencyId, Set<PatternHour>>>();

	let ridesProcessed = 0;
	for (const ride of ridesCursor) {
		ridesProcessed++;
		if (ridesProcessed % 10_000 === 0) {
			Logger.info({ message: `Processed ${ridesProcessed} failed rides...` });
		}

		const operationalDate: OperationalDate = ride.operational_date;
		const agencyId: AgencyId = String(ride.agency_id);

		const patternHour: PatternHour = ride.pattern_hour;

		if (!operationalDayMap.has(operationalDate)) {
			operationalDayMap.set(operationalDate, new Map<AgencyId, Set<PatternHour>>());
		}

		const agencyMap = operationalDayMap.get(operationalDate);
		if (!agencyMap) throw new Error('Operational day group was not initialized');

		if (!agencyMap.has(agencyId)) {
			agencyMap.set(agencyId, new Set<PatternHour>());
		}

		agencyMap.get(agencyId)?.add(patternHour);
	}

	// Global union of failed patternHours (used to restrict the median query)
	Logger.info({ message: 'Building failed patternHours set...' });
	const failedPatternHoursSet = new Set<PatternHour>();
	for (const [, agencyMap] of operationalDayMap) {
		for (const [, phSet] of agencyMap) {
			for (const ph of phSet) failedPatternHoursSet.add(ph);
		}
	}

	Logger.info({ message: `Found ${failedPatternHoursSet.size} failed patternHours.` });
	const failedPatternHours = [...failedPatternHoursSet];
	if (failedPatternHours.length === 0) {
		console.log('No failed patternHours in the selected interval.');
		return new Map<OperationalDate, Map<AgencyId, AgencyDayStats>>();
	}

	Logger.info({ message: 'Calculating passenger impact for each day...' });
	const out = new Map<OperationalDate, Map<AgencyId, AgencyDayStats>>();

	for (const dayChunk of allDaysChunks) {
		const start30dTs = Dates.fromUnixMilliseconds(dayChunk.start)
			.set({ hour: 4, minute: 0, second: 0 })
			.setZone('Europe/Lisbon', 'rebase_utc')
			.minus({ days: 30 })
			.unix_milliseconds;

		const endTs = Dates.fromUnixMilliseconds(dayChunk.start)
			.set({ hour: 4, minute: 0, second: 0 })
			.setZone('Europe/Lisbon', 'rebase_utc')
			.unix_milliseconds;

		Logger.info(
			{ message: `Calculating passenger impact for day ${Dates.fromUnixMilliseconds(start30dTs).toLocaleString('full')}...${Dates.fromUnixMilliseconds(endTs).toLocaleString('full')}` },
		);

		// 2) Median passengers_observed per (agency_id, patternHour) over the last 30 days
		const passengersAgg = await labDb.queryFromString<PassengerAggRow>(
			`SELECT agency_id,
			        concat(shape_id, '_', formatDateTime(fromUnixTimestamp64Milli(start_time_scheduled, 'Europe/Lisbon'), '%H:%i')) AS pattern_hour,
			        groupArray(passengers_observed) AS values
			 FROM operation.rides FINAL
			 WHERE agency_id IN $3 AND passengers_observed IS NOT NULL
			   AND start_time_scheduled >= $1 AND start_time_scheduled < $2
			   AND pattern_hour IN $4
			 GROUP BY agency_id, pattern_hour`,
			{ 1: start30dTs, 2: endTs, 3: [...GO_CM_AGENCY_IDS], 4: failedPatternHours },
		);

		// medianByAgencyPH[agency][patternHour] = mediana(passengers_observed)
		const medianByAgencyPH = new Map<AgencyId, Map<PatternHour, number>>();

		for (const row of passengersAgg) {
			const agencyId: AgencyId = String(row.agency_id);
			const patternHour: PatternHour = String(row.pattern_hour);

			const values: number[] = (row.values ?? [])
				.map((v: number) => Number(v))
				.filter((v: number) => Number.isFinite(v));

			if (!medianByAgencyPH.has(agencyId)) {
				medianByAgencyPH.set(agencyId, new Map<PatternHour, number>());
			}

			medianByAgencyPH.get(agencyId)?.set(patternHour, median(values));
		}

		// 3) Aggregate ONLY for the current dayChunk's operational day
		const operationalDateForChunk = OperationalDateSchema.parse(String(Dates
			.fromUnixMilliseconds(dayChunk.start) // NOTE: assumes Dates.fromUnixMilliseconds accepts ms here (same as your current usage)
			.setZone('Europe/Lisbon', 'rebase_utc')
			.operational_date_int));

		// If there were no failed rides for this operational date, skip
		const agencyMapForDay = operationalDayMap.get(operationalDateForChunk);
		if (!agencyMapForDay) {
			continue;
		}

		const outAgency = new Map<AgencyId, AgencyDayStats>();

		for (const [agencyId, phSet] of agencyMapForDay) {
			const failedCirculations = phSet.size;

			let estimatedAffectedPassengers = 0;
			const medMap = medianByAgencyPH.get(agencyId);

			for (const ph of phSet) {
				estimatedAffectedPassengers += medMap?.get(ph) ?? 0;
			}

			outAgency.set(agencyId, {
				estimated_affected_passengers: estimatedAffectedPassengers,
				failed_circulations: failedCirculations,
			});
		}

		out.set(operationalDateForChunk, outAgency);
	}

	// 4) Export: 1 doc per agency_id with days inside `data`
	const metricKey = 'demand_affected_by_failed_circulations_by_day' as const;

	// dataByAgency[agency] = { [operational_day]: { ...stats } }
	const dataByAgency = new Map<
		AgencyId,
		Record<string, { estimated_affected_passengers: number, failed_circulations: number }>
	>();

	for (const [operationalDay, agencyMap] of out.entries()) {
		for (const [agencyIdRaw, stats] of agencyMap.entries()) {
			const agencyId: AgencyId = String(agencyIdRaw);

			let data = dataByAgency.get(agencyId);
			if (!data) {
				data = {};
				dataByAgency.set(agencyId, data);
			}

			data[String(operationalDay)] = {
				estimated_affected_passengers: stats.estimated_affected_passengers,
				failed_circulations: stats.failed_circulations,
			};
		}
	}

	const results = Array.from(dataByAgency.entries()).map(([agencyId, data]) => ({
		data,
		description: `Passenger impact (estimated) for agency ${agencyId} by operational day`,
		generated_at: new Date(),
		metric: metricKey,
		properties: { agency_id: agencyId },
	}));

	// clear existing (match working example field name)
	await goDb.performance.metrics.deleteMany({ metric: metricKey });

	// insertMany
	if (results.length > 0) {
		await goDb.performance.metrics.insertMany(results);
	}

	return out;
}
