/* * */

import { parseDateBoundary, parseDateRange, parseIds } from '@/endpoints/metrics/utils/query-params.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type PlannedSupplyLineDashboardQueryInput, PlannedSupplyLineDashboardQueryInputSchema, type RidePerformanceBaselineComparisonQueryInput, RidePerformanceBaselineComparisonQueryInputSchema, type RidePerformanceBreakdownQueryInput, RidePerformanceBreakdownQueryInputSchema, type RidePerformanceComparisonQueryInput, RidePerformanceComparisonQueryInputSchema, type RidePerformanceFilters, RidePerformanceFiltersSchema, type RidePerformanceOverTimeQueryInput, RidePerformanceOverTimeQueryInputSchema } from '@tmlmobilidade/go-types-performance';
import { type z } from 'zod';

/* * */

type QueryValue = boolean | number | string | string[] | undefined;

export interface RidePerformanceHttpFilters {
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
}

export interface RidePerformanceBreakdownHttpQuery extends RidePerformanceHttpFilters {
	limit?: QueryValue
}

export interface RidePerformanceOverTimeHttpQuery extends RidePerformanceHttpFilters {
	time_grain?: QueryValue
}

export interface RidePerformanceComparisonHttpQuery extends Omit<RidePerformanceHttpFilters, 'end_date' | 'start_date'> {
	comparison_end_date?: string
	comparison_start_date?: string
	current_end_date?: string
	current_start_date?: string
}

export type PlannedSupplyLineDashboardHttpQuery = RidePerformanceComparisonHttpQuery;

export interface RidePerformanceBaselineComparisonHttpQuery extends Omit<RidePerformanceHttpFilters, 'end_date' | 'start_date'> {
	operational_date?: string
	sample_size?: QueryValue
}

/* * */

function badRequest(message: string): never {
	throw new HttpException(HTTP_STATUS.BAD_REQUEST, message);
}

function parseWithSchema<TSchema extends z.ZodType>(schema: TSchema, input: unknown): z.output<TSchema> {
	const parsed = schema.safeParse(input);
	if (!parsed.success) badRequest(parsed.error.issues[0]?.message ?? 'Invalid ride-performance query');
	return parsed.data;
}

function parseSingleValue(value: QueryValue, parameterName: string) {
	if (!Array.isArray(value)) return value;
	if (value.length !== 1) badRequest(`${parameterName} must be provided once`);
	return value[0];
}

function parseOptionalBoolean(value: QueryValue, parameterName: string) {
	const scalar = parseSingleValue(value, parameterName);
	if (scalar === undefined) return undefined;
	if (scalar === true || scalar === 'true') return true;
	if (scalar === false || scalar === 'false') return false;
	return badRequest(`${parameterName} must be true or false`);
}

function parseOptionalInteger(value: QueryValue, parameterName: string, limits: { max: number, min: number }) {
	const scalar = parseSingleValue(value, parameterName);
	if (scalar === undefined) return undefined;
	const parsed = typeof scalar === 'number' ? scalar : Number(scalar);
	if (!Number.isInteger(parsed) || parsed < limits.min || parsed > limits.max) {
		return badRequest(`${parameterName} must be an integer between ${limits.min} and ${limits.max}`);
	}
	return parsed;
}

function toStringList(value: QueryValue): string | string[] | undefined {
	if (value === undefined) return undefined;
	if (typeof value === 'boolean' || typeof value === 'number') return String(value);
	return value;
}

function parseRequiredDate(value: string | undefined, name: string, boundary: 'end' | 'start') {
	if (value === undefined) badRequest(`${name} is required`);
	return parseDateBoundary(value, boundary);
}

function buildCommonFilters(query: RidePerformanceHttpFilters) {
	return Object.fromEntries(Object.entries({
		agency_ids: parseIds([toStringList(query.agency_id), toStringList(query.agency_ids)], { max_ids: 200, parameter_name: 'agency_ids' }),
		data_statuses: parseIds([toStringList(query.data_status), toStringList(query.data_statuses)], { max_ids: 2, parameter_name: 'data_statuses' }),
		exclude_unknown: parseOptionalBoolean(query.exclude_unknown, 'exclude_unknown'),
		hour_end: parseOptionalInteger(query.hour_end, 'hour_end', { max: 23, min: 0 }),
		hour_start: parseOptionalInteger(query.hour_start, 'hour_start', { max: 23, min: 0 }),
		line_ids: parseIds([toStringList(query.line_id), toStringList(query.line_ids)], { max_ids: 200, parameter_name: 'line_ids' }),
		pattern_ids: parseIds([toStringList(query.pattern_id), toStringList(query.pattern_ids)], { max_ids: 200, parameter_name: 'pattern_ids' }),
	}).filter(([, value]) => value !== undefined));
}

function requiredPeriod(query: Pick<RidePerformanceHttpFilters, 'end_date' | 'start_date'>) {
	const period = parseDateRange(query);
	if (period.start_date === undefined || period.end_date === undefined) badRequest('start_date and end_date are required');
	return period as { end_date: number, start_date: number };
}

/* * */

export function buildRidePerformanceFilters(query: RidePerformanceHttpFilters): RidePerformanceFilters {
	return parseWithSchema(RidePerformanceFiltersSchema, { ...buildCommonFilters(query), ...requiredPeriod(query) });
}

export function buildRidePerformanceBreakdownInput(query: RidePerformanceBreakdownHttpQuery): RidePerformanceBreakdownQueryInput {
	return parseWithSchema(RidePerformanceBreakdownQueryInputSchema, {
		...buildCommonFilters(query),
		...requiredPeriod(query),
		limit: parseOptionalInteger(query.limit, 'limit', { max: 1_000, min: 1 }),
	});
}

export function buildRidePerformanceOverTimeInput(query: RidePerformanceOverTimeHttpQuery): RidePerformanceOverTimeQueryInput {
	return parseWithSchema(RidePerformanceOverTimeQueryInputSchema, {
		...buildCommonFilters(query),
		...requiredPeriod(query),
		time_grain: parseSingleValue(query.time_grain, 'time_grain'),
	});
}

export function buildRidePerformanceComparisonInput(query: RidePerformanceComparisonHttpQuery): RidePerformanceComparisonQueryInput {
	return parseWithSchema(RidePerformanceComparisonQueryInputSchema, {
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

export function buildPlannedSupplyLineDashboardInput(query: PlannedSupplyLineDashboardHttpQuery): PlannedSupplyLineDashboardQueryInput {
	const agencyId = parseSingleValue(query.agency_id, 'agency_id');
	const lineId = parseSingleValue(query.line_id, 'line_id');
	if (typeof agencyId !== 'string' || !agencyId) badRequest('agency_id is required');
	if (typeof lineId !== 'string' || !lineId) badRequest('line_id is required');
	return parseWithSchema(PlannedSupplyLineDashboardQueryInputSchema, {
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
	});
}

export function buildRidePerformanceBaselineComparisonInput(
	query: RidePerformanceBaselineComparisonHttpQuery,
): RidePerformanceBaselineComparisonQueryInput {
	return parseWithSchema(RidePerformanceBaselineComparisonQueryInputSchema, {
		...buildCommonFilters(query),
		operational_date: parseRequiredDate(query.operational_date, 'operational_date', 'start'),
		sample_size: parseOptionalInteger(query.sample_size, 'sample_size', { max: 8, min: 1 }),
	});
}

/* * */
