/* * */

import { OperationalDateIntSchema, OperationalDateMetadataSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const DEMAND_BY_AGENCY_METRIC_IDS = [
	'demand_by_agency_by_day',
	'demand_by_agency_by_month',
	'demand_by_agency_by_year',
] as const;

export const DemandByAgencyMetricIdSchema = z.enum(DEMAND_BY_AGENCY_METRIC_IDS);
export const DemandByAgencyTimeGrainSchema = z.enum(['day', 'month', 'year']);

export type DemandByAgencyMetricId = z.infer<typeof DemandByAgencyMetricIdSchema>;
export type DemandByAgencyTimeGrain = z.infer<typeof DemandByAgencyTimeGrainSchema>;

/* * */

const DemandMetricBaseSchema = z.object({
	description: z.string().optional(),
	generated_at: z.coerce.date(),
});

const DemandByAgencyBaseSchema = DemandMetricBaseSchema.extend({
	data: z.record(
		z.string(),
		z.object({
			qty: z.number().int().nonnegative(),
		}),
	),
	properties: z.object({
		agency_id: z.string(),
	}),
});

export const DemandByAgencyByDaySchema = DemandByAgencyBaseSchema.extend({
	data: z.record(
		z.string().describe('Operational date in YYYY-MM-DD format'),
		OperationalDateMetadataSchema.pick({
			day_type: true,
			holiday: true,
			notes: true,
			period: true,
		}).extend({
			qty: z.number().int().nonnegative(),
		}),
	),
	metric: z.literal('demand_by_agency_by_day'),
});

export const DemandByAgencyByMonthSchema = DemandByAgencyBaseSchema.extend({
	metric: z.literal('demand_by_agency_by_month'),
});

export const DemandByAgencyByYearSchema = DemandByAgencyBaseSchema.extend({
	metric: z.literal('demand_by_agency_by_year'),
});

export const DemandByAgencyMetricSchema = z.discriminatedUnion('metric', [
	DemandByAgencyByDaySchema,
	DemandByAgencyByMonthSchema,
	DemandByAgencyByYearSchema,
]);

export const DemandByAgencyMetricsByTimeGrainSchema = z.object({
	day: z.array(DemandByAgencyByDaySchema),
	month: z.array(DemandByAgencyByMonthSchema),
	year: z.array(DemandByAgencyByYearSchema),
});

export type DemandByAgencyByDay = z.infer<typeof DemandByAgencyByDaySchema>;
export type DemandByAgencyByMonth = z.infer<typeof DemandByAgencyByMonthSchema>;
export type DemandByAgencyByYear = z.infer<typeof DemandByAgencyByYearSchema>;
export type DemandByAgencyMetric = z.infer<typeof DemandByAgencyMetricSchema>;
export type DemandByAgencyMetricsByTimeGrain = z.infer<typeof DemandByAgencyMetricsByTimeGrainSchema>;

/* * */

const AgencyIdQueryParamSchema = z.union([
	z.string(),
	z.array(z.string()),
]);

export const GetDemandByAgencyQuerySchema = z.object({
	agency_id: AgencyIdQueryParamSchema.optional(),
	agency_ids: AgencyIdQueryParamSchema.optional(),
	end_date: z.string().optional(),
	start_date: z.string().optional(),
	time_grain: DemandByAgencyTimeGrainSchema,
});

export type GetDemandByAgencyQuery = z.infer<typeof GetDemandByAgencyQuerySchema>;

/* * */

export const DemandByAgencyQueryInputSchema = z.object({
	agency_ids: z.array(z.string().min(1)).optional(),
	end_date: OperationalDateIntSchema.optional(),
	start_date: OperationalDateIntSchema.optional(),
	time_grain: DemandByAgencyTimeGrainSchema,
});

export const DemandByAgencyQueryRowSchema = z.object({
	agency_id: z.string(),
	period: z.union([z.number(), z.string()]),
	qty: z.union([z.number(), z.string()]),
});

export type DemandByAgencyQueryInput = z.infer<typeof DemandByAgencyQueryInputSchema>;
export type DemandByAgencyQueryRow = z.infer<typeof DemandByAgencyQueryRowSchema>;
