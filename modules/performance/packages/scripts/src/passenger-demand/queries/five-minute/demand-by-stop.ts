/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type PassengerDemandBreakdownQueryInput, PassengerDemandBreakdownQueryInputSchema, type PassengerDemandByStopItem, PassengerDemandByStopItemSchema, type PassengerDemandByStopQueryRow, PassengerDemandByStopQueryRowSchema } from '@tmlmobilidade/go-types-performance';

import { buildPassengerDemandBreakdownQuery } from './query-support.js';

/* * */

export function buildFiveMinutePassengerDemandByStopQuery(input: PassengerDemandBreakdownQueryInput) {
	const parsedInput = PassengerDemandBreakdownQueryInputSchema.parse(input);
	return buildPassengerDemandBreakdownQuery(parsedInput, 'stop_id');
}

export async function queryFiveMinutePassengerDemandByStop(input: PassengerDemandBreakdownQueryInput): Promise<PassengerDemandByStopItem[]> {
	const { params, query } = buildFiveMinutePassengerDemandByStopQuery(input);
	const rawRows = await labDb.performance.passengerDemandByDimensionsBy5Minutes.queryFromString<PassengerDemandByStopQueryRow>(query, params);
	const rows = PassengerDemandByStopQueryRowSchema.array().parse(rawRows);

	return PassengerDemandByStopItemSchema.array().parse(rows.map(row => ({
		passenger_demand: Number(row.passenger_demand),
		stop_id: row.stop_id,
	})));
}

/* * */
