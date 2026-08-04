/* * */

import { OperationalDateIntSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

const NonNegativeIntegerSchema = z.number().int().nonnegative();
const NonNegativeMeasureSchema = z.number().nonnegative();

export const ServiceComplianceStatusSchema = z.enum([
	'below_target',
	'meets_target',
	'unavailable',
]);

export const ServiceComplianceValueSchema = z.object({
	compliance_pct: NonNegativeMeasureSchema.max(100).nullable(),
	compliance_status: ServiceComplianceStatusSchema,
	executed_rides_qty: NonNegativeIntegerSchema,
	rides_without_execution_evidence_qty: NonNegativeIntegerSchema,
	scheduled_rides_qty: NonNegativeIntegerSchema,
	unexecuted_rides_qty: NonNegativeIntegerSchema,
});

export const ServiceComplianceTrendPointSchema = z.object({
	compliance_pct: NonNegativeMeasureSchema.max(100).nullable(),
	executed_rides_qty: NonNegativeIntegerSchema,
	interval_start: UnixTimestampSchema,
	scheduled_rides_qty: NonNegativeIntegerSchema,
});

export const ServiceComplianceAgencyMetricsSchema = z.object({
	agency_id: z.string(),
	availability: z.boolean(),
	trend: z.array(ServiceComplianceTrendPointSchema),
	value: ServiceComplianceValueSchema.nullable(),
});

export const ServiceComplianceMetricsSchema = z.object({
	agencies: z.array(ServiceComplianceAgencyMetricsSchema),
	definition_version: z.literal('service-compliance-v1'),
	meta: z.object({
		current_cutoff: UnixTimestampSchema,
		current_operational_date: OperationalDateIntSchema,
		generated_at: UnixTimestampSchema,
		interval_minutes: z.number().int().positive(),
		requested_agency_ids: z.array(z.string()).min(1),
		status: z.enum(['complete', 'partial']),
		target_pct: NonNegativeMeasureSchema.max(100),
		unavailable_agency_ids: z.array(z.string()),
	}),
	total: z.object({
		trend: z.array(ServiceComplianceTrendPointSchema),
		value: ServiceComplianceValueSchema.nullable(),
	}),
});

export type ServiceComplianceAgencyMetrics = z.infer<typeof ServiceComplianceAgencyMetricsSchema>;
export type ServiceComplianceMetrics = z.infer<typeof ServiceComplianceMetricsSchema>;
export type ServiceComplianceStatus = z.infer<typeof ServiceComplianceStatusSchema>;
export type ServiceComplianceTrendPoint = z.infer<typeof ServiceComplianceTrendPointSchema>;
export type ServiceComplianceValue = z.infer<typeof ServiceComplianceValueSchema>;
