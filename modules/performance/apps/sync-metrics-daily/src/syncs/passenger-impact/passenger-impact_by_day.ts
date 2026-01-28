import { Dates } from '@tmlmobilidade/dates';
import { AggregationPipeline, metrics, rides } from '@tmlmobilidade/interfaces';
import { OperationalDate, Ride } from '@tmlmobilidade/types';

type AgencyId = string;
type PatternHour = string;

interface PassengerAggRow {
	_id: {
		agency_id: AgencyId
		patternHour: PatternHour
	}
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
	const agencyFilter: AgencyId[] = ['41', '42', '43', '44'];

	// Target interval (operational cut-off at 04:00)
	const startDate = Dates.now('Europe/Lisbon')
		.set({ day: 1, hour: 4, month: 1, year: 2024 })
		.unix_timestamp;

	const endDate = Dates.now('Europe/Lisbon')
		.set({ hour: 4 })
		.unix_timestamp;

	// Rolling 30-day window (aligned with the 04:00 operational cut-off)
	const start30dTs = Dates.now('Europe/Lisbon')
		.set({ hour: 4 })
		.minus({ days: 30 })
		.unix_timestamp;

	const endTs = Dates.now('Europe/Lisbon')
		.set({ hour: 4 })
		.unix_timestamp;

	// 1) Failed rides in the target interval -> operationalDayMap[opDate][agency] = Set(patternHour)
	const ridesCollection = await rides.getCollection();

	const ridesPipeline: AggregationPipeline<Ride> = [
		{
			$match: {
				'agency_id': { $in: agencyFilter },
				'analysis.SIMPLE_ONE_APEX_VALIDATION.grade': 'fail',
				'analysis.SIMPLE_THREE_VEHICLE_EVENTS.grade': 'fail',
				'start_time_scheduled': { $gte: startDate, $lt: endDate },
			},
		},
	];

	const ridesCursor = ridesCollection.aggregate<Ride>(ridesPipeline);

	const operationalDayMap = new Map<OperationalDate, Map<AgencyId, Set<PatternHour>>>();

	for await (const ride of ridesCursor) {
		const operationalDate: OperationalDate = ride.operational_date;
		const agencyId: AgencyId = String(ride.agency_id);

		const date = new Date(ride.start_time_scheduled);
		const time = date.toLocaleTimeString('pt-PT', {
			hour: '2-digit',
			hour12: false,
			minute: '2-digit',
			timeZone: 'Europe/Lisbon',
		});

		const patternHour: PatternHour = `${String(ride.pattern_id)}_${time}`;

		if (!operationalDayMap.has(operationalDate)) {
			operationalDayMap.set(operationalDate, new Map<AgencyId, Set<PatternHour>>());
		}

		const agencyMap = operationalDayMap.get(operationalDate);

		if (!agencyMap.has(agencyId)) {
			agencyMap.set(agencyId, new Set<PatternHour>());
		}

		agencyMap.get(agencyId).add(patternHour);
	}

	// Global union of failed patternHours (used to restrict the median query)
	const failedPatternHoursSet = new Set<PatternHour>();
	for (const [, agencyMap] of operationalDayMap) {
		for (const [, phSet] of agencyMap) {
			for (const ph of phSet) failedPatternHoursSet.add(ph);
		}
	}

	const failedPatternHours = [...failedPatternHoursSet];
	if (failedPatternHours.length === 0) {
		console.log('No failed patternHours in the selected interval.');
		return new Map<OperationalDate, Map<AgencyId, AgencyDayStats>>();
	}

	// 2) Median passengers_observed per (agency_id, patternHour) over the last 30 days
	const passengersPipeline: AggregationPipeline<Ride> = [
		{
			$match: {
				agency_id: { $in: agencyFilter },
				passengers_observed: { $ne: null },
				start_time_scheduled: { $gte: start30dTs, $lt: endTs },
			},
		},
		{
			$addFields: {
				patternHour: {
					$concat: [
						{ $toString: '$pattern_id' },
						'_',
						{
							$dateToString: {
								date: { $toDate: '$start_time_scheduled' },
								format: '%H:%M',
								timezone: 'Europe/Lisbon',
							},
						},
					],
				},
			},
		},
		{
			$match: {
				patternHour: { $in: failedPatternHours },
			},
		},
		{
			$group: {
				_id: {
					agency_id: '$agency_id',
					patternHour: '$patternHour',
				},
				values: { $push: '$passengers_observed' },
			},
		},
	];

	const passengersAgg = await ridesCollection
		.aggregate<PassengerAggRow>(passengersPipeline)
		.toArray();

	// medianByAgencyPH[agency][patternHour] = mediana(passengers_observed)
	const medianByAgencyPH = new Map<AgencyId, Map<PatternHour, number>>();

	for (const row of passengersAgg) {
		const agencyId: AgencyId = String(row._id.agency_id);
		const patternHour: PatternHour = String(row._id.patternHour);

		const values: number[] = (row.values ?? [])
			.map((v: number) => Number(v))
			.filter((v: number) => Number.isFinite(v));

		if (!medianByAgencyPH.has(agencyId)) {
			medianByAgencyPH.set(agencyId, new Map<PatternHour, number>());
		}

		medianByAgencyPH.get(agencyId).set(patternHour, median(values));
	}

	// 3) Aggregate by day and agency
	const out = new Map<OperationalDate, Map<AgencyId, AgencyDayStats>>();

	for (const [operationalDate, agencyMap] of operationalDayMap) {
		const outAgency = new Map<AgencyId, AgencyDayStats>();

		for (const [agencyId, phSet] of agencyMap) {
			const failed_circulations = phSet.size;

			let estimated_affected_passengers = 0;
			const medMap = medianByAgencyPH.get(agencyId);

			for (const ph of phSet) {
				estimated_affected_passengers += medMap?.get(ph) ?? 0;
			}

			outAgency.set(agencyId, {
				estimated_affected_passengers,
				failed_circulations,
			});
		}

		out.set(operationalDate, outAgency);
	}

	// 4) Export: 1 doc per agency_id with days inside `data`

	const METRIC = 'demand_affected_by_failed_circulations_by_day' as const;

	// dataByAgency[agency] = { [operational_day]: { ...stats } }
	const dataByAgency = new Map<
		AgencyId,
		Record<string, { estimated_affected_passengers: number, failed_circulations: number }>
	>();

	for (const [operational_day, agencyMap] of out.entries()) {
		for (const [agency_id_raw, stats] of agencyMap.entries()) {
			const agency_id: AgencyId = String(agency_id_raw);

			let data = dataByAgency.get(agency_id);
			if (!data) {
				data = {};
				dataByAgency.set(agency_id, data);
			}

			data[String(operational_day)] = {
				estimated_affected_passengers: stats.estimated_affected_passengers,
				failed_circulations: stats.failed_circulations,
			};
		}
	}

	const results = Array.from(dataByAgency.entries()).map(([agency_id, data]) => ({
		data,
		description: `Passenger impact (estimated) for agency ${agency_id} by operational day`,
		generated_at: new Date(),
		metric: METRIC,
		properties: { agency_id },
	}));

	// clear existing (match working example field name)
	await metrics.deleteMany({ metric: METRIC });

	// insertMany
	if (results.length > 0) {
		await metrics.insertMany(results);
	}
}
