/* * */

import { OperationalDateIntSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

const NonNegativeMeasureSchema = z.number().nonnegative();
const PercentageSchema = z.number().min(0).max(100);

export const VkmExecutionStatusSchema = z.enum([
	'below_target',
	'unavailable',
	'within_target',
]);

export const VkmExecutionValueSchema = z.object({
	distance_to_plan_km: NonNegativeMeasureSchema,
	executed_distance_km: NonNegativeMeasureSchema,
	execution_pct: PercentageSchema.nullable(),
	execution_status: VkmExecutionStatusSchema,
	scheduled_distance_km: NonNegativeMeasureSchema,
});

export const VkmExecutionTrendPointSchema = z.object({
	executed_distance_km: NonNegativeMeasureSchema,
	execution_pct: PercentageSchema.nullable(),
	interval_start: UnixTimestampSchema,
	scheduled_distance_km: NonNegativeMeasureSchema,
});

export const VkmExecutionAgencyMetricsSchema = z.object({
	agency_id: z.string(),
	availability: z.boolean(),
	trend: z.array(VkmExecutionTrendPointSchema),
	value: VkmExecutionValueSchema.nullable(),
});

export const VkmExecutionMetricsSchema = z.object({
	agencies: z.array(VkmExecutionAgencyMetricsSchema),
	definition_version: z.literal('vkm-execution-v1'),
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
		trend: z.array(VkmExecutionTrendPointSchema),
		value: VkmExecutionValueSchema.nullable(),
	}),
});

export type VkmExecutionAgencyMetrics = z.infer<typeof VkmExecutionAgencyMetricsSchema>;
export type VkmExecutionMetrics = z.infer<typeof VkmExecutionMetricsSchema>;
export type VkmExecutionStatus = z.infer<typeof VkmExecutionStatusSchema>;
export type VkmExecutionTrendPoint = z.infer<typeof VkmExecutionTrendPointSchema>;
export type VkmExecutionValue = z.infer<typeof VkmExecutionValueSchema>;
