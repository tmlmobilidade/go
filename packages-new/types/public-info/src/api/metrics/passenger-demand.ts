/* * */

import { OperationalDateIntSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

const NonNegativeIntegerSchema = z.number().int().nonnegative();
const NonNegativeMeasureSchema = z.number().nonnegative();

export const PassengerDemandSeriesPointSchema = z.object({
	interval_index: NonNegativeIntegerSchema,
	interval_start: UnixTimestampSchema,
	passenger_validations_qty: NonNegativeIntegerSchema,
});

export const PassengerDemandComparisonDaySchema = z.object({
	operational_date: OperationalDateIntSchema,
	points: z.array(PassengerDemandSeriesPointSchema),
});

export const PassengerDemandRealtimeValueSchema = z.object({
	comparison_index_pct: NonNegativeMeasureSchema.nullable(),
	passenger_validations_qty_last_week: NonNegativeIntegerSchema,
	passenger_validations_qty_now: NonNegativeIntegerSchema,
});

export const PassengerDemandSnapshotAgencySchema = z.object({
	comparable_days: z.array(PassengerDemandComparisonDaySchema),
	current_points: z.array(PassengerDemandSeriesPointSchema),
	realtime: PassengerDemandRealtimeValueSchema,
});

export const PassengerDemandMetricsSnapshotSchema = z.object({
	agencies: z.record(z.string(), PassengerDemandSnapshotAgencySchema),
	definition_version: z.literal('passenger-demand-v2'),
	meta: z.object({
		baseline_sample_size_target: NonNegativeIntegerSchema,
		current_cutoff: UnixTimestampSchema,
		current_operational_date: OperationalDateIntSchema,
		generated_at: UnixTimestampSchema,
		interval_minutes: z.literal(15),
		last_week_cutoff: UnixTimestampSchema,
		last_week_operational_date: OperationalDateIntSchema,
		source_watermark: UnixTimestampSchema.nullable(),
	}),
});

export const PassengerDemandTypicalRangeSchema = z.object({
	lower: NonNegativeMeasureSchema,
	upper: NonNegativeMeasureSchema,
});

export const PassengerDemandValueSchema = PassengerDemandRealtimeValueSchema.extend({
	deviation_status: z.enum(['above_typical', 'below_typical', 'typical', 'unavailable']),
	typical_comparison_index_pct: NonNegativeMeasureSchema.nullable(),
	typical_cumulative_qty: NonNegativeMeasureSchema.nullable(),
	typical_range: PassengerDemandTypicalRangeSchema.nullable(),
});

export const PassengerDemandTrendPointSchema = z.object({
	interval_start: UnixTimestampSchema,
	passenger_validations_qty: NonNegativeIntegerSchema,
	typical: z.object({
		lower: NonNegativeMeasureSchema,
		median: NonNegativeMeasureSchema,
		upper: NonNegativeMeasureSchema,
	}).nullable(),
});

export const PassengerDemandAgencyMetricsSchema = z.object({
	agency_id: z.string(),
	availability: z.boolean(),
	trend: z.array(PassengerDemandTrendPointSchema),
	value: PassengerDemandValueSchema.nullable(),
});

export const PassengerDemandMetricsSchema = z.object({
	agencies: z.array(PassengerDemandAgencyMetricsSchema),
	definition_version: z.literal('passenger-demand-v2'),
	meta: PassengerDemandMetricsSnapshotSchema.shape.meta.extend({
		baseline_operational_dates: z.array(OperationalDateIntSchema),
		baseline_sample_size: NonNegativeIntegerSchema,
		requested_agency_ids: z.array(z.string()).min(1),
		status: z.enum(['complete', 'partial']),
		unavailable_agency_ids: z.array(z.string()),
	}),
	total: z.object({
		trend: z.array(PassengerDemandTrendPointSchema),
		value: PassengerDemandValueSchema.nullable(),
	}),
});

export type PassengerDemandAgencyMetrics = z.infer<typeof PassengerDemandAgencyMetricsSchema>;
export type PassengerDemandMetrics = z.infer<typeof PassengerDemandMetricsSchema>;
export type PassengerDemandMetricsSnapshot = z.infer<typeof PassengerDemandMetricsSnapshotSchema>;
export type PassengerDemandSeriesPoint = z.infer<typeof PassengerDemandSeriesPointSchema>;
export type PassengerDemandSnapshotAgency = z.infer<typeof PassengerDemandSnapshotAgencySchema>;
export type PassengerDemandTrendPoint = z.infer<typeof PassengerDemandTrendPointSchema>;
export type PassengerDemandValue = z.infer<typeof PassengerDemandValueSchema>;
