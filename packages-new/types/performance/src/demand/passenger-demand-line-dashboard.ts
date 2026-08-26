/* * */

import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

const PeriodSchema = z.object({
	end_date: OperationalDateIntSchema,
	start_date: OperationalDateIntSchema,
}).refine(period => period.start_date <= period.end_date, { message: 'start_date must not be after end_date' });

export const PassengerDemandLineDashboardQueryInputSchema = z.object({
	agency_id: z.string().min(1),
	comparison_period: PeriodSchema,
	current_period: PeriodSchema,
	line_id: z.string().min(1),
	record_period: PeriodSchema,
});

export const PassengerDemandDayTypeSchema = z.enum(['saturday', 'sunday_holiday', 'weekday']);

export const PassengerDemandRecordSchema = z.object({
	day_type: PassengerDemandDayTypeSchema,
	operational_date: OperationalDateIntSchema,
	passenger_demand: z.number().int().nonnegative(),
});

export const PassengerDemandCompositionItemSchema = z.object({
	comparison_qty: z.number().int().nonnegative(),
	comparison_share_pct: z.number().nonnegative(),
	current_qty: z.number().int().nonnegative(),
	current_share_pct: z.number().nonnegative(),
	id: z.string(),
	share_delta_pp: z.number(),
});

export const PassengerDemandContributionItemSchema = z.object({
	comparison_qty: z.number().int().nonnegative(),
	current_qty: z.number().int().nonnegative(),
	difference_qty: z.number().int(),
	id: z.string(),
	label: z.string().optional(),
});

export const PassengerDemandProductivityMetricsSchema = z.object({
	delivered_vehicle_km: z.number().nonnegative(),
	operated_rides_qty: z.number().int().nonnegative(),
	validations_per_delivered_vehicle_km: z.number().nullable(),
	validations_per_operated_ride: z.number().nullable(),
});

export const PassengerDemandLineDashboardSchema = z.object({
	composition: z.object({
		categories: PassengerDemandCompositionItemSchema.array(),
		products: PassengerDemandCompositionItemSchema.array(),
	}),
	contributions: z.object({
		patterns: PassengerDemandContributionItemSchema.array(),
		stops: PassengerDemandContributionItemSchema.array(),
	}),
	productivity: z.object({
		comparison: PassengerDemandProductivityMetricsSchema,
		current: PassengerDemandProductivityMetricsSchema,
	}),
	records: PassengerDemandRecordSchema.array(),
});

export const PassengerDemandDailyTotalQueryRowSchema = z.object({
	operational_date: z.union([z.number(), z.string()]),
	passenger_demand: z.union([z.number(), z.string()]),
});

export const PassengerDemandDashboardBreakdownQueryRowSchema = z.object({
	comparison_qty: z.union([z.number(), z.string()]),
	current_qty: z.union([z.number(), z.string()]),
	id: z.string(),
});

export const PassengerDemandProductivityQueryRowSchema = z.object({
	comparison_distance_m: z.union([z.number(), z.string()]),
	comparison_execution_failures_qty: z.union([z.number(), z.string()]),
	comparison_scheduled_rides_qty: z.union([z.number(), z.string()]),
	current_distance_m: z.union([z.number(), z.string()]),
	current_execution_failures_qty: z.union([z.number(), z.string()]),
	current_scheduled_rides_qty: z.union([z.number(), z.string()]),
});

export type PassengerDemandLineDashboardQueryInput = z.infer<typeof PassengerDemandLineDashboardQueryInputSchema>;
export type PassengerDemandDayType = z.infer<typeof PassengerDemandDayTypeSchema>;
export type PassengerDemandRecord = z.infer<typeof PassengerDemandRecordSchema>;
export type PassengerDemandCompositionItem = z.infer<typeof PassengerDemandCompositionItemSchema>;
export type PassengerDemandContributionItem = z.infer<typeof PassengerDemandContributionItemSchema>;
export type PassengerDemandProductivityMetrics = z.infer<typeof PassengerDemandProductivityMetricsSchema>;
export type PassengerDemandLineDashboard = z.infer<typeof PassengerDemandLineDashboardSchema>;
export type PassengerDemandDailyTotalQueryRow = z.infer<typeof PassengerDemandDailyTotalQueryRowSchema>;
export type PassengerDemandDashboardBreakdownQueryRow = z.infer<typeof PassengerDemandDashboardBreakdownQueryRowSchema>;
export type PassengerDemandProductivityQueryRow = z.infer<typeof PassengerDemandProductivityQueryRowSchema>;
