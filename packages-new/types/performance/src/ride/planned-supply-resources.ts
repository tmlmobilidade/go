/* * */

import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { PlannedSupplyDayProfileSchema, PlannedSupplyHeatmapCellSchema, PlannedSupplyMetricsSchema, PlannedSupplyOverTimePointSchema } from './planned-supply-line-dashboard.js';

/* * */

export const PlannedSupplyQueryInputSchema = z.object({
	agency_id: z.string().min(1),
	end_date: OperationalDateIntSchema,
	line_id: z.string().min(1),
	start_date: OperationalDateIntSchema,
}).refine(period => period.start_date <= period.end_date, { message: 'start_date must not be after end_date' });

export const PlannedSupplySeriesSchema = z.object({
	points: PlannedSupplyOverTimePointSchema.array(),
	totals: PlannedSupplyMetricsSchema,
});

export const PlannedSupplyBreakdownDimensionSchema = z.enum(['pattern']);

export const PlannedSupplyBreakdownQueryInputSchema = PlannedSupplyQueryInputSchema.and(z.object({
	dimension: PlannedSupplyBreakdownDimensionSchema,
}));

export const PlannedSupplyBreakdownItemSchema = z.object({
	id: z.string(),
	rides_share_pct: z.number().nonnegative(),
	scheduled_rides_qty: z.number().int().nonnegative(),
	scheduled_vehicle_km: z.number().nonnegative(),
});

export const PlannedSupplyBreakdownSchema = z.object({
	dimension: PlannedSupplyBreakdownDimensionSchema,
	items: PlannedSupplyBreakdownItemSchema.array(),
});

export const PlannedSupplyTimeProfileSchema = z.object({ cells: PlannedSupplyHeatmapCellSchema.array() });
export const PlannedSupplyDayProfilesSchema = z.object({ profiles: PlannedSupplyDayProfileSchema.array() });

export type PlannedSupplyQueryInput = z.infer<typeof PlannedSupplyQueryInputSchema>;
export type PlannedSupplySeries = z.infer<typeof PlannedSupplySeriesSchema>;
export type PlannedSupplyBreakdownDimension = z.infer<typeof PlannedSupplyBreakdownDimensionSchema>;
export type PlannedSupplyBreakdownQueryInput = z.infer<typeof PlannedSupplyBreakdownQueryInputSchema>;
export type PlannedSupplyBreakdownItem = z.infer<typeof PlannedSupplyBreakdownItemSchema>;
export type PlannedSupplyBreakdown = z.infer<typeof PlannedSupplyBreakdownSchema>;
export type PlannedSupplyTimeProfile = z.infer<typeof PlannedSupplyTimeProfileSchema>;
export type PlannedSupplyDayProfiles = z.infer<typeof PlannedSupplyDayProfilesSchema>;

/* * */
