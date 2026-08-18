/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type PassengerDemandOverTimePoint, PassengerDemandOverTimePointSchema, type PassengerDemandOverTimeQueryInput, PassengerDemandOverTimeQueryInputSchema, type PassengerDemandOverTimeQueryRow, PassengerDemandOverTimeQueryRowSchema } from '@tmlmobilidade/go-types-performance';

import { buildPassengerDemandFilterContext, PASSENGER_DEMAND_PERIOD_EXPRESSIONS } from './query-support.js';

/* * */

export function buildFiveMinutePassengerDemandOverTimeQuery(input: PassengerDemandOverTimeQueryInput) {
	const parsedInput = PassengerDemandOverTimeQueryInputSchema.parse(input);
	const context = buildPassengerDemandFilterContext(parsedInput);
	const periodExpression = PASSENGER_DEMAND_PERIOD_EXPRESSIONS[parsedInput.time_grain];

	return {
		params: context.params,
		query: `
			SELECT
				${periodExpression} AS period,
				sum(accepted_validations_qty) AS passenger_demand
			FROM performance.passenger_demand_by_dimensions_by_5_minutes
			WHERE ${context.conditions.join('\n\t\t\t\tAND ')}
			GROUP BY period
			ORDER BY period
		`,
	};
}

export async function queryFiveMinutePassengerDemandOverTime(input: PassengerDemandOverTimeQueryInput): Promise<PassengerDemandOverTimePoint[]> {
	const { params, query } = buildFiveMinutePassengerDemandOverTimeQuery(input);
	const rawRows = await labDb.performance.passengerDemandByDimensionsBy5Minutes.queryFromString<PassengerDemandOverTimeQueryRow>(query, params);
	const rows = PassengerDemandOverTimeQueryRowSchema.array().parse(rawRows);

	return PassengerDemandOverTimePointSchema.array().parse(rows.map(row => ({
		passenger_demand: Number(row.passenger_demand),
		period: Number(row.period),
	})));
}

/* * */
