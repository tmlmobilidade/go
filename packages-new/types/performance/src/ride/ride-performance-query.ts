/* * */

import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { RidePerformanceDataStatusSchema } from './ride-service-by-ride.js';

/* * */

const IdListSchema = z.array(z.string().min(1)).min(1).max(200);
const PeriodFields = {
	end_date: OperationalDateIntSchema,
	start_date: OperationalDateIntSchema,
};
const FilterFields = {
	...PeriodFields,
	agency_ids: IdListSchema.optional(),
	data_statuses: z.array(RidePerformanceDataStatusSchema).min(1).max(2).optional(),
	exclude_unknown: z.boolean().optional(),
	hour_end: z.number().int().min(0).max(23).optional(),
	hour_start: z.number().int().min(0).max(23).optional(),
	line_ids: IdListSchema.optional(),
	pattern_ids: IdListSchema.optional(),
};

function validateFilters(
	filters: { end_date: number, hour_end?: number, hour_start?: number, start_date: number },
	context: z.RefinementCtx,
) {
	if (filters.start_date > filters.end_date) {
		context.addIssue({ code: 'custom', message: 'start_date must not be after end_date', path: ['start_date'] });
	}
	if ((filters.hour_start === undefined) !== (filters.hour_end === undefined)) {
		context.addIssue({ code: 'custom', message: 'hour_start and hour_end must be provided together', path: ['hour_start'] });
	}
}

/* * */

export const RidePerformancePeriodSchema = z.object(PeriodFields).refine(
	period => period.start_date <= period.end_date,
	{ message: 'start_date must not be after end_date' },
);
export const RidePerformanceFiltersSchema = z.object(FilterFields).superRefine(validateFilters);
export const RidePerformanceBreakdownQueryInputSchema = z.object({
	...FilterFields,
	limit: z.number().int().min(1).max(1_000).optional(),
}).superRefine(validateFilters);
export const RidePerformanceOverTimeQueryInputSchema = z.object({
	...FilterFields,
	time_grain: z.enum(['day', 'hour']),
}).superRefine(validateFilters);
export const RidePerformanceComparisonQueryInputSchema = z.object({
	agency_ids: IdListSchema.optional(),
	comparison_period: RidePerformancePeriodSchema,
	current_period: RidePerformancePeriodSchema,
	data_statuses: z.array(RidePerformanceDataStatusSchema).min(1).max(2).optional(),
	exclude_unknown: z.boolean().optional(),
	line_ids: IdListSchema.optional(),
	pattern_ids: IdListSchema.optional(),
});

/* * */

export const RidePerformanceMetricsSchema = z.object({
	advanced_rides_qty: z.number().int().nonnegative(),
	advances_pct: z.number().nullable(),
	coverage_pct: z.number().nullable(),
	delay_eligible_rides_qty: z.number().int().nonnegative(),
	delayed_rides_qty: z.number().int().nonnegative(),
	delays_pct: z.number().nullable(),
	execution_failure_rides_qty: z.number().int().nonnegative(),
	observed_start_rides_qty: z.number().int().nonnegative(),
	scheduled_rides_qty: z.number().int().nonnegative(),
	service_pct: z.number().nullable(),
});

const ComparisonFields = {
	advances_delta_pp: z.number().nullable(),
	comparison: RidePerformanceMetricsSchema,
	coverage_delta_pp: z.number().nullable(),
	current: RidePerformanceMetricsSchema,
	delays_delta_pp: z.number().nullable(),
	service_delta_pp: z.number().nullable(),
};

export const RidePerformanceComparisonSchema = z.object(ComparisonFields);
export const RidePerformanceByLineItemSchema = z.object({
	...ComparisonFields,
	agency_id: z.string(),
	line_id: z.string(),
});
export const RidePerformanceByPatternItemSchema = RidePerformanceMetricsSchema.extend({
	pattern_id: z.string(),
});
export const RidePerformanceOverTimePointSchema = RidePerformanceMetricsSchema.extend({
	period: z.number().int().nonnegative(),
});
export const RidePerformanceHeatmapCellSchema = RidePerformanceMetricsSchema.extend({
	day_of_week: z.number().int().min(1).max(7),
	hour: z.number().int().min(0).max(23),
});

/* * */

export type RidePerformanceFilters = z.infer<typeof RidePerformanceFiltersSchema>;
export type RidePerformanceBreakdownQueryInput = z.infer<typeof RidePerformanceBreakdownQueryInputSchema>;
export type RidePerformanceOverTimeQueryInput = z.infer<typeof RidePerformanceOverTimeQueryInputSchema>;
export type RidePerformanceComparisonQueryInput = z.infer<typeof RidePerformanceComparisonQueryInputSchema>;
export type RidePerformanceMetrics = z.infer<typeof RidePerformanceMetricsSchema>;
export type RidePerformanceComparison = z.infer<typeof RidePerformanceComparisonSchema>;
export type RidePerformanceByLineItem = z.infer<typeof RidePerformanceByLineItemSchema>;
export type RidePerformanceByPatternItem = z.infer<typeof RidePerformanceByPatternItemSchema>;
export type RidePerformanceOverTimePoint = z.infer<typeof RidePerformanceOverTimePointSchema>;
export type RidePerformanceHeatmapCell = z.infer<typeof RidePerformanceHeatmapCellSchema>;

/* * */
