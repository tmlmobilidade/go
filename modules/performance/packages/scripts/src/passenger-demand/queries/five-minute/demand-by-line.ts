/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type PassengerDemandBreakdownQueryInput, PassengerDemandBreakdownQueryInputSchema, type PassengerDemandByLineItem, PassengerDemandByLineItemSchema, type PassengerDemandByLineQueryRow, PassengerDemandByLineQueryRowSchema } from '@tmlmobilidade/go-types-performance';

import { buildPassengerDemandBreakdownQuery } from './query-support.js';

/* * */

export function buildFiveMinutePassengerDemandByLineQuery(input: PassengerDemandBreakdownQueryInput) {
	const parsedInput = PassengerDemandBreakdownQueryInputSchema.parse(input);
	return buildPassengerDemandBreakdownQuery(parsedInput, 'line_id', true);
}

export async function queryFiveMinutePassengerDemandByLine(input: PassengerDemandBreakdownQueryInput): Promise<PassengerDemandByLineItem[]> {
	const { params, query } = buildFiveMinutePassengerDemandByLineQuery(input);
	const rawRows = await labDb.performance.passengerDemandByDimensionsBy5Minutes.queryFromString<PassengerDemandByLineQueryRow>(query, params);
	const rows = PassengerDemandByLineQueryRowSchema.array().parse(rawRows);

	return PassengerDemandByLineItemSchema.array().parse(rows.map(row => ({
		agency_id: row.agency_id,
		line_id: row.line_id,
		passenger_demand: Number(row.passenger_demand),
	})));
}

/* * */
