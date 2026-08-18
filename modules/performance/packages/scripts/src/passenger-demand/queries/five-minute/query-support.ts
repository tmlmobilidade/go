/* * */

import { type PassengerDemandBreakdownQueryInput, type PassengerDemandFiveMinuteFilters, type PassengerDemandFiveMinuteTimeGrain } from '@tmlmobilidade/go-types-performance';

import { PASSENGER_DEMAND_DEFINITION_VERSION, PASSENGER_DEMAND_TIMEZONE, PASSENGER_DEMAND_UNKNOWN_DIMENSION_ID } from '../../definition.js';

/* * */

export type QueryParam = number | string | string[];

export interface BuiltQuery {
	params: Record<string, QueryParam>
	query: string
}

export interface FilterContext {
	conditions: string[]
	next_param_index: number
	params: Record<string, QueryParam>
}

type CommonFilters = Omit<PassengerDemandFiveMinuteFilters, 'end_date' | 'start_date'>;

export const PASSENGER_DEMAND_PERIOD_EXPRESSIONS: Record<PassengerDemandFiveMinuteTimeGrain, string> = {
	'5_minutes': 'interval_start',
	'day': 'operational_date',
	'hour': 'intDiv(interval_start, 3600000) * 3600000',
};

const LOCAL_HOUR_EXPRESSION = `toHour(fromUnixTimestamp64Milli(interval_start, '${PASSENGER_DEMAND_TIMEZONE}'))`;

/* * */

function addParamCondition(
	context: FilterContext,
	condition: (placeholder: string) => string,
	value: QueryParam,
) {
	const placeholder = `$${context.next_param_index}`;
	context.conditions.push(condition(placeholder));
	context.params[context.next_param_index] = value;
	context.next_param_index += 1;
}

export function addPassengerDemandCommonFilters(context: FilterContext, filters: CommonFilters) {
	const idFilters = [
		['agency_id', filters.agency_ids],
		['line_id', filters.line_ids],
		['pattern_id', filters.pattern_ids],
		['stop_id', filters.stop_ids],
	] as const;

	for (const [column, ids] of idFilters) {
		if (ids?.length) addParamCondition(context, placeholder => `${column} IN ${placeholder}`, ids);
	}

	if (filters.data_statuses?.length) {
		addParamCondition(context, placeholder => `data_status IN ${placeholder}`, filters.data_statuses);
	}

	if (filters.exclude_unknown) {
		context.conditions.push(`line_id != '${PASSENGER_DEMAND_UNKNOWN_DIMENSION_ID}'`);
		context.conditions.push(`pattern_id != '${PASSENGER_DEMAND_UNKNOWN_DIMENSION_ID}'`);
		context.conditions.push(`stop_id != '${PASSENGER_DEMAND_UNKNOWN_DIMENSION_ID}'`);
	}

	if (filters.hour_start !== undefined && filters.hour_end !== undefined) {
		const startPlaceholder = `$${context.next_param_index}`;
		context.params[context.next_param_index] = filters.hour_start;
		context.next_param_index += 1;
		const endPlaceholder = `$${context.next_param_index}`;
		context.params[context.next_param_index] = filters.hour_end;
		context.next_param_index += 1;

		context.conditions.push(filters.hour_start <= filters.hour_end
			? `${LOCAL_HOUR_EXPRESSION} BETWEEN ${startPlaceholder} AND ${endPlaceholder}`
			: `(${LOCAL_HOUR_EXPRESSION} >= ${startPlaceholder} OR ${LOCAL_HOUR_EXPRESSION} <= ${endPlaceholder})`);
	}
}

export function buildPassengerDemandFilterContext(filters: PassengerDemandFiveMinuteFilters): FilterContext {
	const context: FilterContext = {
		conditions: [
			'definition_version = $1',
			'operational_date >= $2',
			'operational_date <= $3',
		],
		next_param_index: 4,
		params: {
			1: PASSENGER_DEMAND_DEFINITION_VERSION,
			2: filters.start_date,
			3: filters.end_date,
		},
	};

	addPassengerDemandCommonFilters(context, filters);
	return context;
}

export function buildPassengerDemandBreakdownQuery(
	input: PassengerDemandBreakdownQueryInput,
	dimensionColumn: 'line_id' | 'pattern_id' | 'stop_id',
	includeAgencyId = false,
): BuiltQuery {
	const context = buildPassengerDemandFilterContext(input);
	const limit = input.limit ?? 100;
	const dimensions = includeAgencyId ? `agency_id, ${dimensionColumn}` : dimensionColumn;

	return {
		params: context.params,
		query: `
			SELECT
				${dimensions},
				sum(accepted_validations_qty) AS passenger_demand
			FROM performance.passenger_demand_by_dimensions_by_5_minutes
			WHERE ${context.conditions.join('\n\t\t\t\tAND ')}
			GROUP BY ${dimensions}
			ORDER BY passenger_demand DESC, ${dimensions}
			LIMIT ${limit}
		`,
	};
}

/* * */
