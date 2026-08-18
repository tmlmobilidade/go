/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type PassengerDemandBreakdownQueryInput, PassengerDemandBreakdownQueryInputSchema, type PassengerDemandByPatternItem, PassengerDemandByPatternItemSchema, type PassengerDemandByPatternQueryRow, PassengerDemandByPatternQueryRowSchema } from '@tmlmobilidade/go-types-performance';

import { buildPassengerDemandBreakdownQuery } from './query-support.js';

/* * */

export function buildFiveMinutePassengerDemandByPatternQuery(input: PassengerDemandBreakdownQueryInput) {
	const parsedInput = PassengerDemandBreakdownQueryInputSchema.parse(input);
	return buildPassengerDemandBreakdownQuery(parsedInput, 'pattern_id');
}

export async function queryFiveMinutePassengerDemandByPattern(input: PassengerDemandBreakdownQueryInput): Promise<PassengerDemandByPatternItem[]> {
	const { params, query } = buildFiveMinutePassengerDemandByPatternQuery(input);
	const rawRows = await labDb.performance.passengerDemandByDimensionsBy5Minutes.queryFromString<PassengerDemandByPatternQueryRow>(query, params);
	const rows = PassengerDemandByPatternQueryRowSchema.array().parse(rawRows);

	return PassengerDemandByPatternItemSchema.array().parse(rows.map(row => ({
		passenger_demand: Number(row.passenger_demand),
		pattern_id: row.pattern_id,
	})));
}

/* * */
