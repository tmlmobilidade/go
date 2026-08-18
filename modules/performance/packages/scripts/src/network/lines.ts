/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { createPerformanceNetworkLineId, type PerformanceNetworkLine, PerformanceNetworkLineSchema, type PerformanceNetworkPattern, PerformanceNetworkPatternSchema } from '@tmlmobilidade/go-types-performance';
import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';

/* * */

type QueryParam = number | string | string[];

export interface PerformanceNetworkPeriod {
	end_date: OperationalDateInt
	start_date: OperationalDateInt
}

export interface PerformanceNetworkLinesQueryInput extends PerformanceNetworkPeriod {
	agency_ids?: string[]
	line_ids?: string[]
}

export interface PerformanceNetworkLineQueryInput extends PerformanceNetworkPeriod {
	agency_id: string
	line_id: string
}

interface NetworkLineRow {
	agency_id: string
	code: string
	name: string
}

interface NetworkPatternRow {
	code: string
	destination: string
	headsign: string
	origin: string
}

/* * */

export function buildPerformanceNetworkLinesQuery(input: PerformanceNetworkLinesQueryInput) {
	const conditions = [
		'operational_date >= $1',
		'operational_date <= $2',
		`route_short_name != ''`,
	];
	const params: Record<number, QueryParam> = {
		1: input.start_date,
		2: input.end_date,
	};
	let nextParam = 3;

	if (input.agency_ids?.length) {
		conditions.push(`agency_id IN $${nextParam}`);
		params[nextParam] = input.agency_ids;
		nextParam += 1;
	}

	if (input.line_ids?.length) {
		conditions.push(`route_short_name IN $${nextParam}`);
		params[nextParam] = input.line_ids;
	}

	return {
		params,
		query: `
			SELECT
				agency_id,
				route_short_name AS code,
				argMax(
					route_long_name,
					tuple(operational_date, updated_at, start_time_scheduled)
				) AS name
			FROM operation.rides FINAL
			WHERE ${conditions.join('\n\t\t\t\tAND ')}
			GROUP BY agency_id, code
			ORDER BY agency_id, code
		`,
	};
}

/* * */

export async function queryPerformanceNetworkLines(input: PerformanceNetworkLinesQueryInput): Promise<PerformanceNetworkLine[]> {
	const { params, query } = buildPerformanceNetworkLinesQuery(input);
	const rows = await labDb.operation.rides.queryFromString<NetworkLineRow>(query, params);

	return PerformanceNetworkLineSchema.array().parse(rows.map(row => ({
		_id: createPerformanceNetworkLineId(row.agency_id, row.code),
		agency_id: row.agency_id,
		code: row.code,
		name: row.name || row.code,
	})));
}

/* * */

export function buildPerformanceNetworkPatternsQuery(input: PerformanceNetworkLineQueryInput) {
	return {
		params: {
			1: input.start_date,
			2: input.end_date,
			3: input.agency_id,
			4: input.line_id,
		},
		query: `
			WITH representative_rides AS
			(
				SELECT
					splitByChar('|', trip_id)[1] AS pattern_id,
					argMax(
						tuple(headsign, hashed_trip_id),
						tuple(operational_date, updated_at, start_time_scheduled)
					) AS metadata
				FROM operation.rides FINAL
				WHERE
					operational_date >= $1
					AND operational_date <= $2
					AND agency_id = $3
					AND route_short_name = $4
					AND pattern_id != ''
				GROUP BY pattern_id
			),
			trip_bounds AS
			(
				SELECT
					hashed_trip._id AS hashed_trip_id,
					argMin(hashed_trip.stop_name, hashed_trip.stop_sequence) AS origin,
					argMax(hashed_trip.stop_name, hashed_trip.stop_sequence) AS destination
				FROM operation.hashed_trips AS hashed_trip FINAL
				INNER JOIN representative_rides AS ride
					ON ride.metadata.2 = hashed_trip._id
				GROUP BY hashed_trip._id
			)
			SELECT
				ride.pattern_id AS code,
				bounds.destination AS destination,
				ride.metadata.1 AS headsign,
				bounds.origin AS origin
			FROM representative_rides AS ride
			LEFT JOIN trip_bounds AS bounds
				ON bounds.hashed_trip_id = ride.metadata.2
			ORDER BY code
		`,
	};
}

/* * */

export async function queryPerformanceNetworkLine(input: PerformanceNetworkLineQueryInput) {
	const [line] = await queryPerformanceNetworkLines({
		...input,
		agency_ids: [input.agency_id],
		line_ids: [input.line_id],
	});
	if (!line) return null;

	const { params, query } = buildPerformanceNetworkPatternsQuery(input);
	const rows = await labDb.operation.rides.queryFromString<NetworkPatternRow>(query, params);
	const patterns = PerformanceNetworkPatternSchema.array().parse(rows.map((row): PerformanceNetworkPattern => ({
		_id: row.code,
		code: row.code,
		destination: row.destination,
		headsign: row.headsign,
		origin: row.origin,
	})));

	return { line, patterns };
}

