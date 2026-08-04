/* * */

import { OperationalDateIntSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

const NonNegativeIntegerSchema = z.number().int().nonnegative();
const PercentageSchema = z.number().min(0).max(100);

export const DepartureDelayStatusSchema = z.enum([
	'above_target',
	'unavailable',
	'within_target',
]);

export const DepartureDelayValueSchema = z.object({
	average_start_delay_minutes: z.number().nonnegative().nullable(),
	coverage_pct: PercentageSchema.nullable(),
	delay_status: DepartureDelayStatusSchema,
	delayed_more_than_five_minutes_pct: PercentageSchema.nullable(),
	delayed_more_than_five_minutes_rides_qty: NonNegativeIntegerSchema,
	eligible_rides_qty: NonNegativeIntegerSchema,
	observed_rides_qty: NonNegativeIntegerSchema,
});

export const DepartureDelayTrendPointSchema = z.object({
	delay_10_to_20_minutes_rides_qty: NonNegativeIntegerSchema,
	delay_5_to_10_minutes_rides_qty: NonNegativeIntegerSchema,
	delay_more_than_20_minutes_rides_qty: NonNegativeIntegerSchema,
	delayed_more_than_five_minutes_pct: PercentageSchema.nullable(),
	interval_start: UnixTimestampSchema,
	observed_rides_qty: NonNegativeIntegerSchema,
});

export const DepartureDelayAgencyMetricsSchema = z.object({
	agency_id: z.string(),
	availability: z.boolean(),
	trend: z.array(DepartureDelayTrendPointSchema),
	value: DepartureDelayValueSchema.nullable(),
});

export const DepartureDelayMetricsSchema = z.object({
	agencies: z.array(DepartureDelayAgencyMetricsSchema),
	definition_version: z.literal('departure-delays-v1'),
	meta: z.object({
		current_cutoff: UnixTimestampSchema,
		current_operational_date: OperationalDateIntSchema,
		generated_at: UnixTimestampSchema,
		interval_minutes: z.number().int().positive(),
		requested_agency_ids: z.array(z.string()).min(1),
		status: z.enum(['complete', 'partial']),
		target_pct: PercentageSchema,
		unavailable_agency_ids: z.array(z.string()),
	}),
	total: z.object({
		trend: z.array(DepartureDelayTrendPointSchema),
		value: DepartureDelayValueSchema.nullable(),
	}),
});

export type DepartureDelayAgencyMetrics = z.infer<typeof DepartureDelayAgencyMetricsSchema>;
export type DepartureDelayMetrics = z.infer<typeof DepartureDelayMetricsSchema>;
export type DepartureDelayStatus = z.infer<typeof DepartureDelayStatusSchema>;
export type DepartureDelayTrendPoint = z.infer<typeof DepartureDelayTrendPointSchema>;
export type DepartureDelayValue = z.infer<typeof DepartureDelayValueSchema>;
