/* * */

import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

const PeriodSchema = z.object({
	end_date: OperationalDateIntSchema,
	start_date: OperationalDateIntSchema,
}).refine(period => period.start_date <= period.end_date, { message: 'start_date must not be after end_date' });

export const PlannedSupplyLineDashboardQueryInputSchema = z.object({
	agency_id: z.string().min(1),
	comparison_period: PeriodSchema,
	current_period: PeriodSchema,
	line_id: z.string().min(1),
});

export const PlannedSupplyMetricsSchema = z.object({
	active_days_qty: z.number().int().nonnegative(),
	rides_per_active_day: z.number().nonnegative(),
	scheduled_rides_qty: z.number().int().nonnegative(),
	scheduled_vehicle_km: z.number().nonnegative(),
	vehicle_km_per_active_day: z.number().nonnegative(),
});

export const PlannedSupplyOverTimePointSchema = z.object({
	operational_date: OperationalDateIntSchema,
	scheduled_rides_qty: z.number().int().nonnegative(),
	scheduled_vehicle_km: z.number().nonnegative(),
});

export const PlannedSupplyHeatmapCellSchema = z.object({
	average_scheduled_rides: z.number().nonnegative(),
	day_of_week: z.number().int().min(1).max(7),
	hour: z.number().int().min(4).max(27),
});

export const PlannedSupplyDayProfileSchema = z.object({
	active_days_qty: z.number().int().nonnegative(),
	average_scheduled_rides: z.number().nonnegative(),
	average_vehicle_km: z.number().nonnegative(),
	day_type: z.enum(['saturday', 'sunday_holiday', 'weekday']),
	first_departure_minute: z.number().int().nonnegative().nullable(),
	last_departure_minute: z.number().int().nonnegative().nullable(),
	median_headway_minutes: z.number().nonnegative().nullable(),
	service_span_minutes: z.number().nonnegative().nullable(),
});

export const PlannedSupplyPatternItemSchema = z.object({
	comparison_rides_qty: z.number().int().nonnegative(),
	comparison_vehicle_km: z.number().nonnegative(),
	current_rides_qty: z.number().int().nonnegative(),
	current_vehicle_km: z.number().nonnegative(),
	id: z.string(),
	rides_difference_pct: z.number().nullable(),
	rides_share_pct: z.number().nonnegative(),
});

export const PlannedSupplyLineDashboardSchema = z.object({
	comparison: PlannedSupplyMetricsSchema,
	current: PlannedSupplyMetricsSchema,
	day_profiles: PlannedSupplyDayProfileSchema.array(),
	evolution: z.object({
		comparison: PlannedSupplyOverTimePointSchema.array(),
		current: PlannedSupplyOverTimePointSchema.array(),
	}),
	heatmap: PlannedSupplyHeatmapCellSchema.array(),
	patterns: PlannedSupplyPatternItemSchema.array(),
});

export const PlannedSupplyDailyPatternQueryRowSchema = z.object({
	departure_minutes: z.array(z.union([z.number(), z.string()])),
	operational_date: z.union([z.number(), z.string()]),
	pattern_id: z.string(),
	scheduled_distance_m: z.union([z.number(), z.string()]),
	scheduled_rides_qty: z.union([z.number(), z.string()]),
});

export type PlannedSupplyLineDashboardQueryInput = z.infer<typeof PlannedSupplyLineDashboardQueryInputSchema>;
export type PlannedSupplyMetrics = z.infer<typeof PlannedSupplyMetricsSchema>;
export type PlannedSupplyOverTimePoint = z.infer<typeof PlannedSupplyOverTimePointSchema>;
export type PlannedSupplyHeatmapCell = z.infer<typeof PlannedSupplyHeatmapCellSchema>;
export type PlannedSupplyDayProfile = z.infer<typeof PlannedSupplyDayProfileSchema>;
export type PlannedSupplyPatternItem = z.infer<typeof PlannedSupplyPatternItemSchema>;
export type PlannedSupplyLineDashboard = z.infer<typeof PlannedSupplyLineDashboardSchema>;
export type PlannedSupplyDailyPatternQueryRow = z.infer<typeof PlannedSupplyDailyPatternQueryRowSchema>;
