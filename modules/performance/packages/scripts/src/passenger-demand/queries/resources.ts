/* * */

import { enrichOperationalDate } from '@tmlmobilidade/dates';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type PassengerDemandBreakdown, PassengerDemandBreakdownQueryRowSchema, PassengerDemandBreakdownSchema, type PassengerDemandDayType, type PassengerDemandProductivity, type PassengerDemandProductivityQueryInput, PassengerDemandProductivityQueryInputSchema, PassengerDemandProductivitySchema, type PassengerDemandProductivityQueryRow, PassengerDemandProductivityQueryRowSchema, type PassengerDemandRecords, type PassengerDemandRecordsQueryInput, PassengerDemandRecordsQueryInputSchema, PassengerDemandRecordsSchema, type PassengerDemandResourceBreakdownQueryInput, PassengerDemandResourceBreakdownQueryInputSchema, type PassengerDemandSeries, type PassengerDemandSeriesQueryInput, PassengerDemandSeriesSchema } from '@tmlmobilidade/go-types-performance';

import { RIDE_PERFORMANCE_DEFINITION_VERSION } from '../../ride-performance/definition.js';
import { PASSENGER_DEMAND_DEFINITION_VERSION, PASSENGER_DEMAND_UNKNOWN_DIMENSION_ID } from '../definition.js';
import { queryFiveMinutePassengerDemandOverTime } from './five-minute/demand-over-time.js';
import { queryFiveMinutePassengerDemandTotal } from './five-minute/demand-total.js';
import { buildPassengerDemandFilterContext } from './five-minute/query-support.js';

/* * */

function getDayType(value: number): PassengerDemandDayType | undefined {
	const enrichedDate = enrichOperationalDate(value);
	if (!enrichedDate) return undefined;
	if (enrichedDate.day_type === '1') return 'weekday';
	if (enrichedDate.day_type === '2') return 'saturday';
	return 'sunday_holiday';
}

function normalizeProductivity(validations: number, scheduled: number, failures: number, distanceMetres: number) {
	const operatedRides = Math.max(0, scheduled - failures);
	const deliveredVehicleKm = distanceMetres / 1_000;
	return {
		delivered_vehicle_km: deliveredVehicleKm,
		operated_rides_qty: operatedRides,
		validations_per_delivered_vehicle_km: deliveredVehicleKm ? validations / deliveredVehicleKm : null,
		validations_per_operated_ride: operatedRides ? validations / operatedRides : null,
	};
}

/* * */

export async function queryPassengerDemandSeries(input: PassengerDemandSeriesQueryInput): Promise<PassengerDemandSeries> {
	const points = await queryFiveMinutePassengerDemandOverTime(input);
	return PassengerDemandSeriesSchema.parse({
		points,
		total: points.reduce((total, point) => total + point.passenger_demand, 0),
	});
}

export function buildPassengerDemandResourceBreakdownQuery(input: PassengerDemandResourceBreakdownQueryInput) {
	const parsed = PassengerDemandResourceBreakdownQueryInputSchema.parse(input);
	const limit = parsed.limit ?? 100;
	const fiveMinuteDimensions = {
		agency: { column: 'agency_id', includeAgency: false },
		line: { column: 'line_id', includeAgency: true },
		pattern: { column: 'pattern_id', includeAgency: false },
		stop: { column: 'stop_id', includeAgency: false },
	} as const;
	const fiveMinuteDimension = parsed.dimension in fiveMinuteDimensions
		? fiveMinuteDimensions[parsed.dimension as keyof typeof fiveMinuteDimensions]
		: undefined;

	if (fiveMinuteDimension) {
		const context = buildPassengerDemandFilterContext(parsed);
		const selectAgency = fiveMinuteDimension.includeAgency ? 'agency_id,' : '';
		const groupAgency = fiveMinuteDimension.includeAgency ? 'agency_id,' : '';
		return {
			params: context.params,
			query: `
				SELECT
					${selectAgency}
					${fiveMinuteDimension.column} AS id,
					sum(accepted_validations_qty) AS passenger_demand,
					sum(sum(accepted_validations_qty)) OVER () AS total_passenger_demand
				FROM performance.passenger_demand_by_dimensions_by_5_minutes
				WHERE ${context.conditions.join('\n\t\t\t\t\tAND ')}
				GROUP BY ${groupAgency} ${fiveMinuteDimension.column}
				ORDER BY passenger_demand DESC, id
				LIMIT ${limit}
			`,
			table: 'five-minute' as const,
		};
	}

	if (parsed.data_statuses?.length || parsed.hour_end !== undefined || parsed.hour_start !== undefined || parsed.stop_ids?.length) {
		throw new Error(`${parsed.dimension} breakdown does not support data-status, hour, or stop filters`);
	}

	const dimensionColumn = parsed.dimension === 'category' ? 'category' : 'product_id';
	const conditions = ['definition_version = $1', 'operational_date >= $2', 'operational_date <= $3'];
	const params: Record<string, number | string | string[]> = {
		1: PASSENGER_DEMAND_DEFINITION_VERSION,
		2: parsed.start_date,
		3: parsed.end_date,
	};
	let nextParam = 4;
	for (const [column, values] of [['agency_id', parsed.agency_ids], ['line_id', parsed.line_ids], ['pattern_id', parsed.pattern_ids]] as const) {
		if (!values?.length) continue;
		conditions.push(`${column} IN $${nextParam}`);
		params[nextParam] = values;
		nextParam += 1;
	}
	if (parsed.exclude_unknown) {
		conditions.push(`line_id != '${PASSENGER_DEMAND_UNKNOWN_DIMENSION_ID}'`);
		conditions.push(`pattern_id != '${PASSENGER_DEMAND_UNKNOWN_DIMENSION_ID}'`);
	}

	return {
		params,
		query: `
			SELECT
				${dimensionColumn} AS id,
				sum(accepted_validations_qty) AS passenger_demand,
				sum(sum(accepted_validations_qty)) OVER () AS total_passenger_demand
			FROM performance.passenger_demand_by_dimensions_by_day
			WHERE ${conditions.join('\n\t\t\t\tAND ')}
			GROUP BY ${dimensionColumn}
			ORDER BY passenger_demand DESC, id
			LIMIT ${limit}
		`,
		table: 'day' as const,
	};
}

export async function queryPassengerDemandBreakdown(input: PassengerDemandResourceBreakdownQueryInput): Promise<PassengerDemandBreakdown> {
	const parsed = PassengerDemandResourceBreakdownQueryInputSchema.parse(input);
	const built = buildPassengerDemandResourceBreakdownQuery(parsed);
	const rawRows = built.table === 'five-minute'
		? await labDb.performance.passengerDemandByDimensionsBy5Minutes.queryFromString(built.query, built.params)
		: await labDb.performance.passengerDemandByDimensionsByDay.queryFromString(built.query, built.params);
	const rows = PassengerDemandBreakdownQueryRowSchema.array().parse(rawRows);
	return PassengerDemandBreakdownSchema.parse({
		dimension: parsed.dimension,
		items: rows.map(row => ({ agency_id: row.agency_id, id: row.id, passenger_demand: Number(row.passenger_demand) })),
		total: Number(rows[0]?.total_passenger_demand ?? 0),
	});
}

export async function queryPassengerDemandRecords(input: PassengerDemandRecordsQueryInput): Promise<PassengerDemandRecords> {
	const parsed = PassengerDemandRecordsQueryInputSchema.parse(input);
	const rawRows = await labDb.performance.passengerDemandByDimensionsByDay.queryFromString<{ operational_date: number | string, passenger_demand: number | string }>(`
		SELECT
			operational_date,
			sum(accepted_validations_qty) AS passenger_demand
		FROM performance.passenger_demand_by_dimensions_by_day
		WHERE definition_version = $1
			AND agency_id = $2
			AND line_id = $3
			AND operational_date BETWEEN $4 AND $5
		GROUP BY operational_date
		ORDER BY operational_date
	`, { 1: PASSENGER_DEMAND_DEFINITION_VERSION, 2: parsed.agency_id, 3: parsed.line_id, 4: parsed.start_date, 5: parsed.end_date });
	const records = new Map<PassengerDemandDayType, { day_type: PassengerDemandDayType, operational_date: number, passenger_demand: number }>();
	for (const row of rawRows) {
		const operationalDate = Number(row.operational_date);
		const dayType = getDayType(operationalDate);
		const passengerDemand = Number(row.passenger_demand);
		const record = dayType ? records.get(dayType) : undefined;
		if (dayType && (!record || passengerDemand > record.passenger_demand)) {
			records.set(dayType, { day_type: dayType, operational_date: operationalDate, passenger_demand: passengerDemand });
		}
	}
	return PassengerDemandRecordsSchema.parse({ records: [...records.values()] });
}

export async function queryPassengerDemandProductivity(input: PassengerDemandProductivityQueryInput): Promise<PassengerDemandProductivity> {
	const parsed = PassengerDemandProductivityQueryInputSchema.parse(input);
	const [demand, productivityRows] = await Promise.all([
		queryFiveMinutePassengerDemandTotal({ agency_ids: [parsed.agency_id], end_date: parsed.end_date, exclude_unknown: true, line_ids: [parsed.line_id], start_date: parsed.start_date }),
		labDb.performance.rideServiceByRide.queryFromString<PassengerDemandProductivityQueryRow>(`
			SELECT
				sum(scheduled_rides_total_qty) AS current_scheduled_rides_qty,
				sum(combined_execution_failure_rides_qty) AS current_execution_failures_qty,
				sum(combined_executed_distance_m) AS current_distance_m,
				0 AS comparison_scheduled_rides_qty,
				0 AS comparison_execution_failures_qty,
				0 AS comparison_distance_m
			FROM performance.ride_service_by_ride
			WHERE definition_version = $1
				AND agency_id = $2
				AND line_id = $3
				AND operational_date BETWEEN $4 AND $5
		`, { 1: RIDE_PERFORMANCE_DEFINITION_VERSION, 2: parsed.agency_id, 3: parsed.line_id, 4: parsed.start_date, 5: parsed.end_date }),
	]);
	const row = PassengerDemandProductivityQueryRowSchema.parse(productivityRows[0]);
	return PassengerDemandProductivitySchema.parse({
		productivity: normalizeProductivity(demand.passenger_demand, Number(row.current_scheduled_rides_qty), Number(row.current_execution_failures_qty), Number(row.current_distance_m)),
	});
}

/* * */
