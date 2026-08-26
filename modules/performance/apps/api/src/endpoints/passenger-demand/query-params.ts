/* * */

import { parseDateBoundary, parseDateRange, parseIds } from '@/endpoints/metrics/utils/query-params.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type PassengerDemandBaselineComparisonQueryInput, PassengerDemandBaselineComparisonQueryInputSchema, type PassengerDemandBreakdownQueryInput, PassengerDemandBreakdownQueryInputSchema, type PassengerDemandComparisonQueryInput, PassengerDemandComparisonQueryInputSchema, type PassengerDemandLineDashboardQueryInput, PassengerDemandLineDashboardQueryInputSchema, type PassengerDemandOverTimeQueryInput, PassengerDemandOverTimeQueryInputSchema, type PassengerDemandTotalQueryInput, PassengerDemandTotalQueryInputSchema } from '@tmlmobilidade/go-types-performance';
import { type z } from 'zod';

/* * */

type QueryValue = boolean | number | string | string[] | undefined;

export interface PassengerDemandHttpFilters {
	agency_id?: QueryValue
	agency_ids?: QueryValue
	data_status?: QueryValue
	data_statuses?: QueryValue
	end_date?: string
	exclude_unknown?: QueryValue
	hour_end?: QueryValue
	hour_start?: QueryValue
	line_id?: QueryValue
	line_ids?: QueryValue
	pattern_id?: QueryValue
	pattern_ids?: QueryValue
	start_date?: string
	stop_id?: QueryValue
	stop_ids?: QueryValue
}

export interface PassengerDemandBreakdownHttpQuery extends PassengerDemandHttpFilters {
	limit?: QueryValue
}

export interface PassengerDemandOverTimeHttpQuery extends PassengerDemandHttpFilters {
	time_grain?: QueryValue
}

export interface PassengerDemandComparisonHttpQuery extends Omit<PassengerDemandHttpFilters, 'end_date' | 'start_date'> {
	comparison_end_date?: string
	comparison_start_date?: string
	current_end_date?: string
	current_start_date?: string
}

export interface PassengerDemandBaselineComparisonHttpQuery extends Omit<PassengerDemandHttpFilters, 'end_date' | 'start_date'> {
	operational_date?: string
	sample_size?: QueryValue
}

export interface PassengerDemandLineDashboardHttpQuery {
	agency_id?: QueryValue
	comparison_end_date?: string
	comparison_start_date?: string
	current_end_date?: string
	current_start_date?: string
	line_id?: QueryValue
	record_end_date?: string
	record_start_date?: string
}

/* * */

function badRequest(message: string): never {
	throw new HttpException(HTTP_STATUS.BAD_REQUEST, message);
}

function parseWithSchema<TSchema extends z.ZodType>(
	schema: TSchema,
	input: unknown,
): z.output<TSchema> {
	const parsed = schema.safeParse(input);
	if (!parsed.success) badRequest(parsed.error.issues[0]?.message ?? 'Invalid passenger-demand query');
	return parsed.data;
}

function parseSingleValue(value: QueryValue, parameterName: string) {
	if (Array.isArray(value)) {
		if (value.length !== 1) badRequest(`${parameterName} must be provided once`);
		return value[0];
	}
	return value;
}

function parseOptionalBoolean(value: QueryValue, parameterName: string) {
	const scalar = parseSingleValue(value, parameterName);
	if (scalar === undefined) return undefined;
	if (scalar === true || scalar === 'true') return true;
	if (scalar === false || scalar === 'false') return false;
	return badRequest(`${parameterName} must be true or false`);
}

function parseOptionalInteger(
	value: QueryValue,
	parameterName: string,
	limits: { max: number, min: number },
) {
	const scalar = parseSingleValue(value, parameterName);
	if (scalar === undefined) return undefined;
	const parsed = typeof scalar === 'number' ? scalar : Number(scalar);
	if (!Number.isInteger(parsed) || parsed < limits.min || parsed > limits.max) {
		return badRequest(`${parameterName} must be an integer between ${limits.min} and ${limits.max}`);
	}
	return parsed;
}

function parseRequiredDateRange(query: Pick<PassengerDemandHttpFilters, 'end_date' | 'start_date'>) {
	const range = parseDateRange(query);
	if (range.start_date === undefined || range.end_date === undefined) {
		badRequest('start_date and end_date are required');
	}
	return range as { end_date: number, start_date: number };
}

function parseRequiredDate(value: string | undefined, parameterName: string, boundary: 'end' | 'start') {
	if (value === undefined) badRequest(`${parameterName} is required`);
	return parseDateBoundary(value, boundary);
}

function buildCommonFilters(query: PassengerDemandHttpFilters) {
	return Object.fromEntries(Object.entries({
		agency_ids: parseIds(
			[toStringList(query.agency_id), toStringList(query.agency_ids)],
			{ max_ids: 200, parameter_name: 'agency_ids' },
		),
		data_statuses: parseIds(
			[toStringList(query.data_status), toStringList(query.data_statuses)],
			{ max_ids: 2, parameter_name: 'data_statuses' },
		),
		exclude_unknown: parseOptionalBoolean(query.exclude_unknown, 'exclude_unknown'),
		hour_end: parseOptionalInteger(query.hour_end, 'hour_end', { max: 23, min: 0 }),
		hour_start: parseOptionalInteger(query.hour_start, 'hour_start', { max: 23, min: 0 }),
		line_ids: parseIds(
			[toStringList(query.line_id), toStringList(query.line_ids)],
			{ max_ids: 200, parameter_name: 'line_ids' },
		),
		pattern_ids: parseIds(
			[toStringList(query.pattern_id), toStringList(query.pattern_ids)],
			{ max_ids: 200, parameter_name: 'pattern_ids' },
		),
		stop_ids: parseIds(
			[toStringList(query.stop_id), toStringList(query.stop_ids)],
			{ max_ids: 200, parameter_name: 'stop_ids' },
		),
	}).filter(([, value]) => value !== undefined));
}

function toStringList(value: QueryValue): string | string[] | undefined {
	if (value === undefined) return undefined;
	if (typeof value === 'boolean' || typeof value === 'number') return String(value);
	return value;
}

/* * */

export function buildPassengerDemandTotalQueryInput(
	query: PassengerDemandHttpFilters,
): PassengerDemandTotalQueryInput {
	return parseWithSchema(PassengerDemandTotalQueryInputSchema, {
		...buildCommonFilters(query),
		...parseRequiredDateRange(query),
	});
}

export function buildPassengerDemandOverTimeQueryInput(
	query: PassengerDemandOverTimeHttpQuery,
): PassengerDemandOverTimeQueryInput {
	return parseWithSchema(PassengerDemandOverTimeQueryInputSchema, {
		...buildCommonFilters(query),
		...parseRequiredDateRange(query),
		time_grain: parseSingleValue(query.time_grain, 'time_grain'),
	});
}

export function buildPassengerDemandBreakdownQueryInput(
	query: PassengerDemandBreakdownHttpQuery,
): PassengerDemandBreakdownQueryInput {
	return parseWithSchema(PassengerDemandBreakdownQueryInputSchema, {
		...buildCommonFilters(query),
		...parseRequiredDateRange(query),
		limit: parseOptionalInteger(query.limit, 'limit', { max: 1_000, min: 1 }),
	});
}

export function buildPassengerDemandComparisonQueryInput(
	query: PassengerDemandComparisonHttpQuery,
): PassengerDemandComparisonQueryInput {
	return parseWithSchema(PassengerDemandComparisonQueryInputSchema, {
		...buildCommonFilters(query),
		comparison_period: {
			end_date: parseRequiredDate(query.comparison_end_date, 'comparison_end_date', 'end'),
			start_date: parseRequiredDate(query.comparison_start_date, 'comparison_start_date', 'start'),
		},
		current_period: {
			end_date: parseRequiredDate(query.current_end_date, 'current_end_date', 'end'),
			start_date: parseRequiredDate(query.current_start_date, 'current_start_date', 'start'),
		},
	});
}

export function buildPassengerDemandBaselineComparisonQueryInput(
	query: PassengerDemandBaselineComparisonHttpQuery,
): PassengerDemandBaselineComparisonQueryInput {
	return parseWithSchema(PassengerDemandBaselineComparisonQueryInputSchema, {
		...buildCommonFilters(query),
		operational_date: parseRequiredDate(query.operational_date, 'operational_date', 'start'),
		sample_size: parseOptionalInteger(query.sample_size, 'sample_size', { max: 8, min: 1 }),
	});
}

export function buildPassengerDemandLineDashboardQueryInput(
	query: PassengerDemandLineDashboardHttpQuery,
): PassengerDemandLineDashboardQueryInput {
	const agencyId = parseSingleValue(query.agency_id, 'agency_id');
	const lineId = parseSingleValue(query.line_id, 'line_id');
	if (typeof agencyId !== 'string' || !agencyId) badRequest('agency_id is required');
	if (typeof lineId !== 'string' || !lineId) badRequest('line_id is required');

	return parseWithSchema(PassengerDemandLineDashboardQueryInputSchema, {
		agency_id: agencyId,
		comparison_period: {
			end_date: parseRequiredDate(query.comparison_end_date, 'comparison_end_date', 'end'),
			start_date: parseRequiredDate(query.comparison_start_date, 'comparison_start_date', 'start'),
		},
		current_period: {
			end_date: parseRequiredDate(query.current_end_date, 'current_end_date', 'end'),
			start_date: parseRequiredDate(query.current_start_date, 'current_start_date', 'start'),
		},
		line_id: lineId,
		record_period: {
			end_date: parseRequiredDate(query.record_end_date, 'record_end_date', 'end'),
			start_date: parseRequiredDate(query.record_start_date, 'record_start_date', 'start'),
		},
	});
}

/* * */
