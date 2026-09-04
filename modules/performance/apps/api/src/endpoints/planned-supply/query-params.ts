/* * */

import { parseDateBoundary } from '@/endpoints/utils/query-params.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type PlannedSupplyBreakdownDimension, PlannedSupplyBreakdownDimensionSchema, type PlannedSupplyBreakdownQueryInput, PlannedSupplyBreakdownQueryInputSchema, type PlannedSupplyQueryInput, PlannedSupplyQueryInputSchema } from '@tmlmobilidade/go-types-performance';
import { type z } from 'zod';

/* * */

type QueryValue = number | string | string[] | undefined;

export interface PlannedSupplyHttpQuery {
	agency_id?: QueryValue
	dimension?: QueryValue
	end_date?: string
	line_id?: QueryValue
	start_date?: string
}

/* * */

function badRequest(message: string): never {
	throw new HttpException(HTTP_STATUS.BAD_REQUEST, message);
}

function parseSingleValue(value: QueryValue, parameterName: string) {
	if (!Array.isArray(value)) return value;
	if (value.length !== 1) badRequest(`${parameterName} must be provided once`);
	return value[0];
}

function parseWithSchema<TSchema extends z.ZodType>(schema: TSchema, input: unknown): z.output<TSchema> {
	const parsed = schema.safeParse(input);
	if (!parsed.success) badRequest(parsed.error.issues[0]?.message ?? 'Invalid planned-supply query');
	return parsed.data;
}

export function buildPlannedSupplyQueryInput(query: PlannedSupplyHttpQuery): PlannedSupplyQueryInput {
	const agencyId = parseSingleValue(query.agency_id, 'agency_id');
	const lineId = parseSingleValue(query.line_id, 'line_id');
	if (typeof agencyId !== 'string' || !agencyId) badRequest('agency_id is required');
	if (typeof lineId !== 'string' || !lineId) badRequest('line_id is required');
	if (!query.start_date || !query.end_date) badRequest('start_date and end_date are required');
	return parseWithSchema(PlannedSupplyQueryInputSchema, {
		agency_id: agencyId,
		end_date: parseDateBoundary(query.end_date, 'end'),
		line_id: lineId,
		start_date: parseDateBoundary(query.start_date, 'start'),
	});
}

export function buildPlannedSupplyBreakdownQueryInput(query: PlannedSupplyHttpQuery): PlannedSupplyBreakdownQueryInput {
	const dimension = PlannedSupplyBreakdownDimensionSchema.safeParse(parseSingleValue(query.dimension, 'dimension'));
	if (!dimension.success) badRequest('dimension must be pattern');
	return parseWithSchema(PlannedSupplyBreakdownQueryInputSchema, {
		...buildPlannedSupplyQueryInput(query),
		dimension: dimension.data as PlannedSupplyBreakdownDimension,
	});
}

/* * */
