/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type PassengerDemandTotal, type PassengerDemandTotalQueryInput, PassengerDemandTotalQueryInputSchema, type PassengerDemandTotalQueryRow, PassengerDemandTotalQueryRowSchema, PassengerDemandTotalSchema } from '@tmlmobilidade/go-types-performance';

import { buildPassengerDemandFilterContext } from './query-support.js';

/* * */

export function buildFiveMinutePassengerDemandTotalQuery(input: PassengerDemandTotalQueryInput) {
	const parsedInput = PassengerDemandTotalQueryInputSchema.parse(input);
	const context = buildPassengerDemandFilterContext(parsedInput);

	return {
		params: context.params,
		query: `
			SELECT coalesce(sum(accepted_validations_qty), 0) AS passenger_demand
			FROM performance.passenger_demand_by_dimensions_by_5_minutes
			WHERE ${context.conditions.join('\n\t\t\t\tAND ')}
		`,
	};
}

export async function queryFiveMinutePassengerDemandTotal(input: PassengerDemandTotalQueryInput): Promise<PassengerDemandTotal> {
	const { params, query } = buildFiveMinutePassengerDemandTotalQuery(input);
	const rawRows = await labDb.performance.passengerDemandByDimensionsBy5Minutes.queryFromString<PassengerDemandTotalQueryRow>(query, params);
	const [row] = PassengerDemandTotalQueryRowSchema.array().parse(rawRows);

	return PassengerDemandTotalSchema.parse({
		passenger_demand: Number(row?.passenger_demand ?? 0),
	});
}

/* * */
