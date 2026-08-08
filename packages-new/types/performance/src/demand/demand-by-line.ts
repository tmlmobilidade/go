/* * */

import { OperationalDateIntSchema, OperationalDateMetadataSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const DEMAND_BY_LINE_METRIC_IDS = [
	'demand_by_line_by_day',
	'demand_by_line_by_month',
	'demand_by_line_by_year',
] as const;

export const DemandByLineMetricIdSchema = z.enum(DEMAND_BY_LINE_METRIC_IDS);
export const DemandByLineTimeGrainSchema = z.enum(['day', 'month', 'year']);

export type DemandByLineMetricId = z.infer<typeof DemandByLineMetricIdSchema>;
export type DemandByLineTimeGrain = z.infer<typeof DemandByLineTimeGrainSchema>;

/* * */

const DemandMetricBaseSchema = z.object({
	description: z.string().optional(),
	generated_at: z.coerce.date(),
});

const DemandByLineBaseSchema = DemandMetricBaseSchema.extend({
	data: z.record(
		z.string(),
		z.object({
			qty: z.number().int().nonnegative(),
		}),
	),
	properties: z.object({
		line_id: z.string(),
	}),
});

export const DemandByLineByDaySchema = DemandByLineBaseSchema.extend({
	data: z.record(
		z.string().describe('Operational date in YYYY-MM-DD format'),
		OperationalDateMetadataSchema.pick({
			day_type: true,
			holiday: true,
			notes: true,
			period: true,
		}).extend({
			qty: z.number().int().nonnegative(),
		}),
	),
	metric: z.literal('demand_by_line_by_day'),
});

export const DemandByLineByMonthSchema = DemandByLineBaseSchema.extend({
	metric: z.literal('demand_by_line_by_month'),
});

export const DemandByLineByYearSchema = DemandByLineBaseSchema.extend({
	metric: z.literal('demand_by_line_by_year'),
});

export const DemandByLineMetricSchema = z.discriminatedUnion('metric', [
	DemandByLineByDaySchema,
	DemandByLineByMonthSchema,
	DemandByLineByYearSchema,
]);

export const DemandByLineMetricsByTimeGrainSchema = z.object({
	day: DemandByLineByDaySchema,
	month: DemandByLineByMonthSchema,
	year: DemandByLineByYearSchema,
});

export type DemandByLineByDay = z.infer<typeof DemandByLineByDaySchema>;
export type DemandByLineByMonth = z.infer<typeof DemandByLineByMonthSchema>;
export type DemandByLineByYear = z.infer<typeof DemandByLineByYearSchema>;
export type DemandByLineMetric = z.infer<typeof DemandByLineMetricSchema>;
export type DemandByLineMetricsByTimeGrain = z.infer<typeof DemandByLineMetricsByTimeGrainSchema>;

/* * */

const LineIdQueryParamSchema = z.union([
	z.string(),
	z.array(z.string()),
]);

export const GetDemandByLineQuerySchema = z.object({
	end_date: z.string().optional(),
	line_id: LineIdQueryParamSchema.optional(),
	line_ids: LineIdQueryParamSchema.optional(),
	start_date: z.string().optional(),
	time_grain: DemandByLineTimeGrainSchema,
}).refine(query => query.line_id !== undefined || query.line_ids !== undefined, {
	message: 'line_id or line_ids is required',
});

export type GetDemandByLineQuery = z.infer<typeof GetDemandByLineQuerySchema>;

/* * */

export const DemandByLineQueryInputSchema = z.object({
	end_date: OperationalDateIntSchema.optional(),
	line_ids: z.array(z.string().min(1)).min(1).max(100).optional(),
	start_date: OperationalDateIntSchema.optional(),
	time_grain: DemandByLineTimeGrainSchema,
});

export const DemandByLineQueryRowSchema = z.object({
	line_id: z.string(),
	period: z.union([z.number(), z.string()]),
	qty: z.union([z.number(), z.string()]),
});

export type DemandByLineQueryInput = z.infer<typeof DemandByLineQueryInputSchema>;
export type DemandByLineQueryRow = z.infer<typeof DemandByLineQueryRowSchema>;
