/* * */

import { OperationalDateIntSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

const NonNegativeIntegerSchema = z.number().int().nonnegative();
const NonNegativeMeasureSchema = z.number().nonnegative();

export const VideowallDemandValueSchema = z.object({
	comparison_index_pct: NonNegativeMeasureSchema.nullable(),
	passenger_validations_qty_last_week: NonNegativeIntegerSchema,
	passenger_validations_qty_now: NonNegativeIntegerSchema,
});

export const VideowallServiceValueSchema = z.object({
	delays: z.object({
		average_start_delay_minutes: NonNegativeMeasureSchema.nullable(),
		delayed_for_more_than_five_minutes_rides_qty: NonNegativeIntegerSchema,
		start_delay_sample_qty: NonNegativeIntegerSchema,
	}),
	sla: z.object({
		scheduled_rides_total_qty: NonNegativeIntegerSchema,
		scheduled_rides_until_cutoff_qty: NonNegativeIntegerSchema,
		simple_one_apex_validation_fail_rides_qty: NonNegativeIntegerSchema,
		simple_three_vehicle_events_fail_rides_qty: NonNegativeIntegerSchema,
		simple_three_vehicle_events_or_apex_validation_fail_rides_qty: NonNegativeIntegerSchema,
	}),
	vkm: z.object({
		scheduled_distance_km: NonNegativeMeasureSchema,
		simple_one_apex_validation_distance_km: NonNegativeMeasureSchema,
		simple_three_vehicle_events_distance_km: NonNegativeMeasureSchema,
		simple_three_vehicle_events_or_apex_validation_distance_km: NonNegativeMeasureSchema,
	}),
});

export const VideowallAgencyMetricsSchema = z.object({
	agency_id: z.string(),
	availability: z.object({
		demand: z.boolean(),
		service: z.boolean(),
	}),
	demand: VideowallDemandValueSchema.nullable(),
	service: VideowallServiceValueSchema.nullable(),
});

const VideowallDemandMetaSchema = z.object({
	current_cutoff: UnixTimestampSchema,
	current_operational_date: OperationalDateIntSchema,
	definition_version: z.literal('passenger-demand-v2'),
	generated_at: UnixTimestampSchema,
	last_week_cutoff: UnixTimestampSchema,
	last_week_operational_date: OperationalDateIntSchema,
});

const VideowallServiceMetaSchema = z.object({
	definition_version: z.literal('videowall-service-legacy-v1'),
	eligible_scheduled_cutoff: UnixTimestampSchema,
	generated_at: UnixTimestampSchema,
	operational_date: OperationalDateIntSchema,
	reference_cutoff: UnixTimestampSchema,
});

export const VideowallMetricsSnapshotSchema = z.object({
	agencies: z.record(z.string(), z.object({
		demand: VideowallDemandValueSchema.nullable(),
		service: VideowallServiceValueSchema.nullable(),
	})),
	definition_version: z.literal('videowall-v2'),
	meta: z.object({
		demand: VideowallDemandMetaSchema,
		service: VideowallServiceMetaSchema,
		sources_aligned: z.boolean(),
	}),
});

export const VideowallMetricsSchema = z.object({
	agencies: z.array(VideowallAgencyMetricsSchema),
	definition_version: z.literal('videowall-v2'),
	meta: z.object({
		demand: VideowallDemandMetaSchema,
		requested_agency_ids: z.array(z.string()).min(1),
		service: VideowallServiceMetaSchema,
		sources_aligned: z.boolean(),
		status: z.enum(['complete', 'partial']),
		unavailable_demand_agency_ids: z.array(z.string()),
		unavailable_service_agency_ids: z.array(z.string()),
	}),
	total: z.object({
		demand: VideowallDemandValueSchema.nullable(),
		service: VideowallServiceValueSchema.nullable(),
	}),
});

export type VideowallAgencyMetrics = z.infer<typeof VideowallAgencyMetricsSchema>;
export type VideowallDemandValue = z.infer<typeof VideowallDemandValueSchema>;
export type VideowallMetrics = z.infer<typeof VideowallMetricsSchema>;
export type VideowallMetricsSnapshot = z.infer<typeof VideowallMetricsSnapshotSchema>;
export type VideowallServiceValue = z.infer<typeof VideowallServiceValueSchema>;
