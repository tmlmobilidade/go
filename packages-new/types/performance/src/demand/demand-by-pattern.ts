/* * */

import { OperationalDateIntSchema, OperationalDateMetadataSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const DEMAND_BY_PATTERN_METRIC_IDS = [
	'demand_by_pattern_by_day',
	'demand_by_pattern_by_month',
	'demand_by_pattern_by_year',
] as const;

export const DemandByPatternMetricIdSchema = z.enum(DEMAND_BY_PATTERN_METRIC_IDS);
export const DemandByPatternTimeGrainSchema = z.enum(['day', 'month', 'year']);

export type DemandByPatternMetricId = z.infer<typeof DemandByPatternMetricIdSchema>;
export type DemandByPatternTimeGrain = z.infer<typeof DemandByPatternTimeGrainSchema>;

/* * */

const DemandMetricBaseSchema = z.object({
	description: z.string().optional(),
	generated_at: z.coerce.date(),
});

const DemandByPatternBaseSchema = DemandMetricBaseSchema.extend({
	data: z.record(
		z.string(),
		z.object({
			qty: z.number().int().nonnegative(),
		}),
	),
	properties: z.object({
		pattern_id: z.string(),
	}),
});

export const DemandByPatternByDaySchema = DemandByPatternBaseSchema.extend({
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
	metric: z.literal('demand_by_pattern_by_day'),
});

export const DemandByPatternByMonthSchema = DemandByPatternBaseSchema.extend({
	metric: z.literal('demand_by_pattern_by_month'),
});

export const DemandByPatternByYearSchema = DemandByPatternBaseSchema.extend({
	metric: z.literal('demand_by_pattern_by_year'),
});

export const DemandByPatternMetricSchema = z.discriminatedUnion('metric', [
	DemandByPatternByDaySchema,
	DemandByPatternByMonthSchema,
	DemandByPatternByYearSchema,
]);

export const DemandByPatternMetricsByTimeGrainSchema = z.object({
	day: DemandByPatternByDaySchema,
	month: DemandByPatternByMonthSchema,
	year: DemandByPatternByYearSchema,
});

export type DemandByPatternByDay = z.infer<typeof DemandByPatternByDaySchema>;
export type DemandByPatternByMonth = z.infer<typeof DemandByPatternByMonthSchema>;
export type DemandByPatternByYear = z.infer<typeof DemandByPatternByYearSchema>;
export type DemandByPatternMetric = z.infer<typeof DemandByPatternMetricSchema>;
export type DemandByPatternMetricsByTimeGrain = z.infer<typeof DemandByPatternMetricsByTimeGrainSchema>;

/* * */

const PatternIdQueryParamSchema = z.union([
	z.string(),
	z.array(z.string()),
]);

export const GetDemandByPatternQuerySchema = z.object({
	end_date: z.string().optional(),
	pattern_id: PatternIdQueryParamSchema.optional(),
	pattern_ids: PatternIdQueryParamSchema.optional(),
	start_date: z.string().optional(),
	time_grain: DemandByPatternTimeGrainSchema,
}).refine(query => query.pattern_id !== undefined || query.pattern_ids !== undefined, {
	message: 'pattern_id or pattern_ids is required',
});

export type GetDemandByPatternQuery = z.infer<typeof GetDemandByPatternQuerySchema>;

/* * */

export const DemandByPatternQueryInputSchema = z.object({
	end_date: OperationalDateIntSchema.optional(),
	pattern_ids: z.array(z.string().min(1)).min(1).max(100).optional(),
	start_date: OperationalDateIntSchema.optional(),
	time_grain: DemandByPatternTimeGrainSchema,
});

export const DemandByPatternQueryRowSchema = z.object({
	pattern_id: z.string(),
	period: z.union([z.number(), z.string()]),
	qty: z.union([z.number(), z.string()]),
});

export type DemandByPatternQueryInput = z.infer<typeof DemandByPatternQueryInputSchema>;
export type DemandByPatternQueryRow = z.infer<typeof DemandByPatternQueryRowSchema>;
