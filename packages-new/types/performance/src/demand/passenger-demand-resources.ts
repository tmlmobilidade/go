/* * */

import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { PassengerDemandBreakdownQueryInputSchema, PassengerDemandOverTimePointSchema, PassengerDemandOverTimeQueryInputSchema } from './passenger-demand-five-minute-query.js';
import { PassengerDemandProductivityMetricsSchema, PassengerDemandRecordSchema } from './passenger-demand-line-dashboard.js';

/* * */

export const PassengerDemandSeriesQueryInputSchema = PassengerDemandOverTimeQueryInputSchema;

export const PassengerDemandSeriesSchema = z.object({
	points: PassengerDemandOverTimePointSchema.array(),
	total: z.number().int().nonnegative(),
});

export const PassengerDemandBreakdownDimensionSchema = z.enum(['agency', 'category', 'line', 'pattern', 'product', 'stop']);

export const PassengerDemandResourceBreakdownQueryInputSchema = PassengerDemandBreakdownQueryInputSchema.and(z.object({
	dimension: PassengerDemandBreakdownDimensionSchema,
}));

export const PassengerDemandBreakdownItemSchema = z.object({
	agency_id: z.string().optional(),
	id: z.string(),
	label: z.string().optional(),
	passenger_demand: z.number().int().nonnegative(),
});

export const PassengerDemandBreakdownQueryRowSchema = z.object({
	agency_id: z.string().optional(),
	id: z.string(),
	passenger_demand: z.union([z.number(), z.string()]),
	total_passenger_demand: z.union([z.number(), z.string()]),
});

export const PassengerDemandBreakdownSchema = z.object({
	dimension: PassengerDemandBreakdownDimensionSchema,
	items: PassengerDemandBreakdownItemSchema.array(),
	total: z.number().int().nonnegative(),
});

export const PassengerDemandRecordsQueryInputSchema = z.object({
	agency_id: z.string().min(1),
	end_date: OperationalDateIntSchema,
	line_id: z.string().min(1),
	start_date: OperationalDateIntSchema,
}).refine(period => period.start_date <= period.end_date, { message: 'start_date must not be after end_date' });

export const PassengerDemandRecordsSchema = z.object({ records: PassengerDemandRecordSchema.array() });

export const PassengerDemandProductivityQueryInputSchema = PassengerDemandRecordsQueryInputSchema;

export const PassengerDemandProductivitySchema = z.object({ productivity: PassengerDemandProductivityMetricsSchema });

export type PassengerDemandSeriesQueryInput = z.infer<typeof PassengerDemandSeriesQueryInputSchema>;
export type PassengerDemandSeries = z.infer<typeof PassengerDemandSeriesSchema>;
export type PassengerDemandBreakdownDimension = z.infer<typeof PassengerDemandBreakdownDimensionSchema>;
export type PassengerDemandResourceBreakdownQueryInput = z.infer<typeof PassengerDemandResourceBreakdownQueryInputSchema>;
export type PassengerDemandBreakdownItem = z.infer<typeof PassengerDemandBreakdownItemSchema>;
export type PassengerDemandBreakdownQueryRow = z.infer<typeof PassengerDemandBreakdownQueryRowSchema>;
export type PassengerDemandBreakdown = z.infer<typeof PassengerDemandBreakdownSchema>;
export type PassengerDemandRecordsQueryInput = z.infer<typeof PassengerDemandRecordsQueryInputSchema>;
export type PassengerDemandRecords = z.infer<typeof PassengerDemandRecordsSchema>;
export type PassengerDemandProductivityQueryInput = z.infer<typeof PassengerDemandProductivityQueryInputSchema>;
export type PassengerDemandProductivity = z.infer<typeof PassengerDemandProductivitySchema>;

/* * */
