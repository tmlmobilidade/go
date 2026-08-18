/* * */

import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { PassengerDemandDataStatusSchema } from './passenger-demand-by-dimensions-by-5-minutes.js';

/* * */

export const PassengerDemandFiveMinuteTimeGrainSchema = z.enum(['5_minutes', 'hour', 'day']);

const IdListSchema = z.array(z.string().min(1)).min(1).max(200);

const PeriodFields = {
	end_date: OperationalDateIntSchema,
	start_date: OperationalDateIntSchema,
};

const FilterFields = {
	...PeriodFields,
	agency_ids: IdListSchema.optional(),
	data_statuses: z.array(PassengerDemandDataStatusSchema).min(1).max(2).optional(),
	exclude_unknown: z.boolean().optional(),
	hour_end: z.number().int().min(0).max(23).optional(),
	hour_start: z.number().int().min(0).max(23).optional(),
	line_ids: IdListSchema.optional(),
	pattern_ids: IdListSchema.optional(),
	stop_ids: IdListSchema.optional(),
};

function validateFilters(
	filters: { end_date: number, hour_end?: number, hour_start?: number, start_date: number },
	context: z.RefinementCtx,
) {
	if (filters.start_date > filters.end_date) {
		context.addIssue({ code: 'custom', message: 'start_date must not be after end_date', path: ['start_date'] });
	}
	if ((filters.hour_start === undefined) !== (filters.hour_end === undefined)) {
		context.addIssue({
			code: 'custom',
			message: 'hour_start and hour_end must be provided together',
			path: filters.hour_start === undefined ? ['hour_start'] : ['hour_end'],
		});
	}
}

/* * */

export const PassengerDemandFiveMinutePeriodSchema = z.object(PeriodFields).refine(
	period => period.start_date <= period.end_date,
	{ message: 'start_date must not be after end_date' },
);

export const PassengerDemandFiveMinuteFiltersSchema = z.object(FilterFields).superRefine(validateFilters);

export const PassengerDemandTotalQueryInputSchema = z.object(FilterFields).superRefine(validateFilters);

export const PassengerDemandOverTimeQueryInputSchema = z.object({
	...FilterFields,
	time_grain: PassengerDemandFiveMinuteTimeGrainSchema,
}).superRefine(validateFilters);

export const PassengerDemandBreakdownQueryInputSchema = z.object({
	...FilterFields,
	limit: z.number().int().min(1).max(1_000).optional(),
}).superRefine(validateFilters);

export const PassengerDemandComparisonQueryInputSchema = z.object({
	agency_ids: IdListSchema.optional(),
	comparison_period: PassengerDemandFiveMinutePeriodSchema,
	current_period: PassengerDemandFiveMinutePeriodSchema,
	data_statuses: z.array(PassengerDemandDataStatusSchema).min(1).max(2).optional(),
	exclude_unknown: z.boolean().optional(),
	hour_end: z.number().int().min(0).max(23).optional(),
	hour_start: z.number().int().min(0).max(23).optional(),
	line_ids: IdListSchema.optional(),
	pattern_ids: IdListSchema.optional(),
	stop_ids: IdListSchema.optional(),
}).superRefine((filters, context) => {
	if ((filters.hour_start === undefined) !== (filters.hour_end === undefined)) {
		context.addIssue({
			code: 'custom',
			message: 'hour_start and hour_end must be provided together',
			path: filters.hour_start === undefined ? ['hour_start'] : ['hour_end'],
		});
	}
});

/* * */

export const PassengerDemandTotalQueryRowSchema = z.object({
	passenger_demand: z.union([z.number(), z.string()]),
});

export const PassengerDemandTotalSchema = z.object({
	passenger_demand: z.number().int().nonnegative(),
});

export const PassengerDemandOverTimeQueryRowSchema = z.object({
	passenger_demand: z.union([z.number(), z.string()]),
	period: z.union([z.number(), z.string()]),
});

export const PassengerDemandOverTimePointSchema = z.object({
	passenger_demand: z.number().int().nonnegative(),
	period: z.number().int().nonnegative(),
});

export const PassengerDemandByLineQueryRowSchema = z.object({
	agency_id: z.string(),
	line_id: z.string(),
	passenger_demand: z.union([z.number(), z.string()]),
});

export const PassengerDemandByLineItemSchema = z.object({
	agency_id: z.string(),
	line_id: z.string(),
	passenger_demand: z.number().int().nonnegative(),
});

export const PassengerDemandByPatternQueryRowSchema = z.object({
	passenger_demand: z.union([z.number(), z.string()]),
	pattern_id: z.string(),
});

export const PassengerDemandByPatternItemSchema = z.object({
	passenger_demand: z.number().int().nonnegative(),
	pattern_id: z.string(),
});

export const PassengerDemandByStopQueryRowSchema = z.object({
	passenger_demand: z.union([z.number(), z.string()]),
	stop_id: z.string(),
});

export const PassengerDemandByStopItemSchema = z.object({
	passenger_demand: z.number().int().nonnegative(),
	stop_id: z.string(),
});

export const PassengerDemandComparisonQueryRowSchema = z.object({
	comparison_qty: z.union([z.number(), z.string()]),
	current_qty: z.union([z.number(), z.string()]),
});

export const PassengerDemandComparisonSchema = z.object({
	comparison_qty: z.number().int().nonnegative(),
	current_qty: z.number().int().nonnegative(),
	difference_pct: z.number().nullable(),
	difference_qty: z.number().int(),
});

/* * */

export type PassengerDemandFiveMinuteTimeGrain = z.infer<typeof PassengerDemandFiveMinuteTimeGrainSchema>;
export type PassengerDemandFiveMinuteFilters = z.infer<typeof PassengerDemandFiveMinuteFiltersSchema>;
export type PassengerDemandFiveMinutePeriod = z.infer<typeof PassengerDemandFiveMinutePeriodSchema>;
export type PassengerDemandTotalQueryInput = z.infer<typeof PassengerDemandTotalQueryInputSchema>;
export type PassengerDemandTotalQueryRow = z.infer<typeof PassengerDemandTotalQueryRowSchema>;
export type PassengerDemandTotal = z.infer<typeof PassengerDemandTotalSchema>;
export type PassengerDemandOverTimeQueryInput = z.infer<typeof PassengerDemandOverTimeQueryInputSchema>;
export type PassengerDemandOverTimeQueryRow = z.infer<typeof PassengerDemandOverTimeQueryRowSchema>;
export type PassengerDemandOverTimePoint = z.infer<typeof PassengerDemandOverTimePointSchema>;
export type PassengerDemandBreakdownQueryInput = z.infer<typeof PassengerDemandBreakdownQueryInputSchema>;
export type PassengerDemandByLineQueryRow = z.infer<typeof PassengerDemandByLineQueryRowSchema>;
export type PassengerDemandByLineItem = z.infer<typeof PassengerDemandByLineItemSchema>;
export type PassengerDemandByPatternQueryRow = z.infer<typeof PassengerDemandByPatternQueryRowSchema>;
export type PassengerDemandByPatternItem = z.infer<typeof PassengerDemandByPatternItemSchema>;
export type PassengerDemandByStopQueryRow = z.infer<typeof PassengerDemandByStopQueryRowSchema>;
export type PassengerDemandByStopItem = z.infer<typeof PassengerDemandByStopItemSchema>;
export type PassengerDemandComparisonQueryInput = z.infer<typeof PassengerDemandComparisonQueryInputSchema>;
export type PassengerDemandComparisonQueryRow = z.infer<typeof PassengerDemandComparisonQueryRowSchema>;
export type PassengerDemandComparison = z.infer<typeof PassengerDemandComparisonSchema>;

/* * */
