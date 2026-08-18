/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type PassengerDemandComparison, type PassengerDemandComparisonQueryInput, PassengerDemandComparisonQueryInputSchema, type PassengerDemandComparisonQueryRow, PassengerDemandComparisonQueryRowSchema, PassengerDemandComparisonSchema } from '@tmlmobilidade/go-types-performance';

import { PASSENGER_DEMAND_DEFINITION_VERSION } from '../../definition.js';
import { addPassengerDemandCommonFilters, type FilterContext } from './query-support.js';

/* * */

export function buildFiveMinutePassengerDemandComparisonQuery(input: PassengerDemandComparisonQueryInput) {
	const parsedInput = PassengerDemandComparisonQueryInputSchema.parse(input);
	const context: FilterContext = {
		conditions: [
			'definition_version = $1',
			'((operational_date BETWEEN $2 AND $3) OR (operational_date BETWEEN $4 AND $5))',
		],
		next_param_index: 6,
		params: {
			1: PASSENGER_DEMAND_DEFINITION_VERSION,
			2: parsedInput.current_period.start_date,
			3: parsedInput.current_period.end_date,
			4: parsedInput.comparison_period.start_date,
			5: parsedInput.comparison_period.end_date,
		},
	};

	addPassengerDemandCommonFilters(context, parsedInput);

	return {
		params: context.params,
		query: `
			SELECT
				coalesce(sumIf(
					accepted_validations_qty,
					operational_date BETWEEN $2 AND $3
				), 0) AS current_qty,
				coalesce(sumIf(
					accepted_validations_qty,
					operational_date BETWEEN $4 AND $5
				), 0) AS comparison_qty
			FROM performance.passenger_demand_by_dimensions_by_5_minutes
			WHERE ${context.conditions.join('\n\t\t\t\tAND ')}
		`,
	};
}

export function calculateFiveMinutePassengerDemandComparison(row: PassengerDemandComparisonQueryRow): PassengerDemandComparison {
	const currentQty = Number(row.current_qty);
	const comparisonQty = Number(row.comparison_qty);
	const differenceQty = currentQty - comparisonQty;

	return PassengerDemandComparisonSchema.parse({
		comparison_qty: comparisonQty,
		current_qty: currentQty,
		difference_pct: comparisonQty === 0 ? null : differenceQty / comparisonQty * 100,
		difference_qty: differenceQty,
	});
}

export async function queryFiveMinutePassengerDemandComparison(input: PassengerDemandComparisonQueryInput) {
	const { params, query } = buildFiveMinutePassengerDemandComparisonQuery(input);
	const rawRows = await labDb.performance.passengerDemandByDimensionsBy5Minutes.queryFromString<PassengerDemandComparisonQueryRow>(query, params);
	const [row] = PassengerDemandComparisonQueryRowSchema.array().parse(rawRows);
	return calculateFiveMinutePassengerDemandComparison(row ?? { comparison_qty: 0, current_qty: 0 });
}

/* * */
